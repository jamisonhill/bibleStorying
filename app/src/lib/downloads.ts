// Audio download manager. Audio stays on biblestoryingkenya.com and is
// downloaded per story (or per collection, sequentially) into the app's
// document directory, respecting the user's "Wi-Fi only" setting.
//
// UI subscribes via useSyncExternalStore-style listeners so cards can show
// live progress without a heavyweight state library.

import { Directory, File, Paths } from 'expo-file-system';
import * as Network from 'expo-network';
import { db, getMeta } from './db';
import type { Story } from './types';

export const audioDir = new Directory(Paths.document, 'audio');
export const imagesDir = new Directory(Paths.document, 'content-images');

export type DownloadPhase = 'idle' | 'queued' | 'downloading' | 'done' | 'error';
export interface DownloadState {
  phase: DownloadPhase;
  /** 0..1 while downloading. */
  progress: number;
  error?: string;
}

const states = new Map<string, DownloadState>();
const listeners = new Set<() => void>();
let version = 0; // bumped on every change; used as the store snapshot

export function subscribeDownloads(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function downloadsVersion(): number {
  return version;
}
function notify(id: string, state: DownloadState) {
  states.set(id, state);
  version++;
  for (const l of listeners) l();
}

/** Filesystem-safe filename for a story id like "cbs/en/noah-and-the-flood". */
const fileNameFor = (storyId: string) => `${storyId.replaceAll('/', '__')}.mp3`;

/** Local audio URI if this story's audio is downloaded, else null. */
export function localAudioUri(storyId: string): string | null {
  const row = db.getFirstSync<{ localUri: string }>(
    'SELECT localUri FROM audio_downloads WHERE storyId = ?', storyId,
  );
  if (!row) return null;
  // The record can outlive the file (OS cleanup, migration) — verify.
  const file = new File(row.localUri);
  if (!file.exists) {
    db.runSync('DELETE FROM audio_downloads WHERE storyId = ?', storyId);
    return null;
  }
  return row.localUri;
}

export function downloadStateFor(storyId: string): DownloadState {
  const active = states.get(storyId);
  if (active && active.phase !== 'done') return active;
  return { phase: localAudioUri(storyId) ? 'done' : 'idle', progress: 0 };
}

/**
 * The user's audio for this story is from an older website version when the
 * stored download URL no longer matches the story's current URL.
 */
export function isAudioStale(story: Story): boolean {
  if (!story.audio) return false;
  const row = db.getFirstSync<{ url: string }>(
    'SELECT url FROM audio_downloads WHERE storyId = ?', story.id,
  );
  return row !== null && row.url !== story.audio.url;
}

/** Throws a friendly error when the Wi-Fi-only setting blocks this download. */
async function assertNetworkAllowed(): Promise<void> {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected) throw new Error('offline');
  const wifiOnly = getMeta('wifiOnly') !== 'false'; // default ON (data is expensive)
  if (wifiOnly && state.type !== Network.NetworkStateType.WIFI) throw new Error('wifi-only');
}

export async function downloadAudio(story: Story): Promise<void> {
  if (!story.audio) return;
  await assertNetworkAllowed();

  audioDir.create({ intermediates: true, idempotent: true });
  const dest = new File(audioDir, fileNameFor(story.id));
  if (dest.exists) dest.delete(); // stale or partial file from a previous try

  notify(story.id, { phase: 'downloading', progress: 0 });
  try {
    const totalBytes = story.audio.bytes;
    await File.downloadFileAsync(story.audio.url, dest, {
      idempotent: true,
      onProgress: (p) => {
        notify(story.id, {
          phase: 'downloading',
          progress: totalBytes > 0 ? Math.min(p.bytesWritten / totalBytes, 1) : 0,
        });
      },
    });
    db.runSync(
      'INSERT OR REPLACE INTO audio_downloads(storyId, url, bytes, localUri, downloadedAt) VALUES(?,?,?,?,?)',
      story.id, story.audio.url, story.audio.bytes, dest.uri, new Date().toISOString(),
    );
    notify(story.id, { phase: 'done', progress: 1 });
  } catch (err) {
    if (dest.exists) dest.delete(); // never keep a partial file
    notify(story.id, { phase: 'error', progress: 0, error: String(err) });
    throw err;
  }
}

export function deleteAudio(storyId: string): void {
  const uri = localAudioUri(storyId);
  if (uri) {
    const file = new File(uri);
    if (file.exists) file.delete();
  }
  db.runSync('DELETE FROM audio_downloads WHERE storyId = ?', storyId);
  notify(storyId, { phase: 'idle', progress: 0 });
}

// --- "Download all" for a collection: a simple sequential queue. ---
// Sequential keeps memory low on 1GB devices and makes progress obvious.

let queueRunning = false;
const queue: Story[] = [];

export function queueCollectionDownload(stories: Story[]): void {
  for (const s of stories) {
    const state = downloadStateFor(s.id);
    if (s.audio && state.phase !== 'done' && state.phase !== 'downloading' && state.phase !== 'queued') {
      queue.push(s);
      notify(s.id, { phase: 'queued', progress: 0 });
    }
  }
  void runQueue();
}

export function cancelQueue(): void {
  for (const s of queue) notify(s.id, { phase: 'idle', progress: 0 });
  queue.length = 0;
}

async function runQueue(): Promise<void> {
  if (queueRunning) return;
  queueRunning = true;
  try {
    while (queue.length > 0) {
      const story = queue.shift()!;
      try {
        await downloadAudio(story);
      } catch {
        // A network drop mid-queue stops the rest (they stay re-queueable)
        // instead of burning through retries on a dead connection.
        cancelQueue();
        break;
      }
    }
  } finally {
    queueRunning = false;
  }
}

/** Total bytes of downloaded audio, for the storage row in Settings. */
export function totalDownloadedBytes(): number {
  const row = db.getFirstSync<{ total: number | null }>(
    'SELECT SUM(bytes) AS total FROM audio_downloads',
  );
  return row?.total ?? 0;
}

export function deleteAllAudio(): void {
  const rows = db.getAllSync<{ storyId: string }>('SELECT storyId FROM audio_downloads');
  for (const r of rows) deleteAudio(r.storyId);
}
