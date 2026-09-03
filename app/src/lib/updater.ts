// Over-the-air content updates. The pipeline publishes a versioned bundle
// (manifest.json + story/page JSONs + images); this module polls the manifest
// at most once a day, and applies only the files whose SHA-256 changed.
// Text and images update silently (they are small); downloaded audio is
// never re-fetched automatically — it is marked stale and the user chooses.

import { Directory, File } from 'expo-file-system';
import * as Network from 'expo-network';
import {
  db, deletePage, deleteVideoRow, getMeta, getMetaNumber, pageShaKey, setMeta,
  upsertPage, upsertStory, upsertVideo,
} from './db';
import { imagesDir } from './downloads';
import type { InfoPage, Manifest, StoryBody } from './types';

/**
 * Where the published content bundle lives. GitHub Pages for the content
 * repo; can be changed by publishing a new app build, or remotely via the
 * "contentBaseUrl" meta override (set from a future manifest field).
 */
export const DEFAULT_CONTENT_BASE_URL =
  'https://jamisonhill.github.io/bibleStorying/';

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function contentBaseUrl(): string {
  return getMeta('contentBaseUrl') ?? DEFAULT_CONTENT_BASE_URL;
}

export interface UpdateResult {
  status: 'updated' | 'up-to-date' | 'offline' | 'skipped' | 'failed';
  fromVersion?: number;
  toVersion?: number;
  error?: string;
}

/** Called on app launch: quiet, throttled, never throws. */
export async function checkForUpdatesIfDue(): Promise<UpdateResult> {
  const last = getMetaNumber('lastUpdateCheck') ?? 0;
  if (Date.now() - last < CHECK_INTERVAL_MS) return { status: 'skipped' };
  return checkForUpdates();
}

/** Full check-and-apply. Settings' "Check for updates" calls this directly. */
export async function checkForUpdates(): Promise<UpdateResult> {
  try {
    const net = await Network.getNetworkStateAsync();
    if (!net.isConnected) return { status: 'offline' };

    const localVersion = getMetaNumber('contentVersion') ?? 0;
    const res = await fetch(new URL('manifest.json', contentBaseUrl()).toString(), {
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
    const manifest = (await res.json()) as Manifest;
    if (manifest.schemaVersion !== 1) {
      // A future bundle format this app version doesn't understand —
      // keep local content and wait for an app update.
      return { status: 'failed', error: `unsupported schemaVersion ${manifest.schemaVersion}` };
    }

    setMeta('lastUpdateCheck', String(Date.now()));
    if (manifest.contentVersion <= localVersion) return { status: 'up-to-date' };

    await applyManifest(manifest);
    setMeta('contentVersion', String(manifest.contentVersion));
    return { status: 'updated', fromVersion: localVersion, toVersion: manifest.contentVersion };
  } catch (err) {
    // Update failures must never break the app — local content still works.
    return { status: 'failed', error: String(err) };
  }
}

async function applyManifest(manifest: Manifest): Promise<void> {
  const base = contentBaseUrl();

  // 1. Fetch changed story bodies (compare per-story text hash).
  const localShas = new Map<string, string>(
    db.getAllSync<{ id: string; textSha: string }>('SELECT id, textSha FROM stories')
      .map((r) => [r.id, r.textSha]),
  );
  const changed: { body: StoryBody; sha: string }[] = [];
  for (const meta of Object.values(manifest.stories)) {
    if (localShas.get(meta.id) === meta.text.sha256) continue;
    const res = await fetch(new URL(meta.text.path, base).toString(), {
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`story ${meta.id} HTTP ${res.status}`);
    changed.push({ body: (await res.json()) as StoryBody, sha: meta.text.sha256 });
  }

  // 2. Fetch changed static pages (About CBS). Few and small, but they are
  //    published content like any story: without this an edit on the website
  //    would only ever reach a phone in a new app build.
  const changedPages: { page: InfoPage; sha: string }[] = [];
  for (const meta of Object.values(manifest.pages)) {
    if (getMeta(pageShaKey(meta.id)) === meta.text.sha256) continue;
    const res = await fetch(new URL(meta.text.path, base).toString(), {
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`page ${meta.id} HTTP ${res.status}`);
    changedPages.push({ page: (await res.json()) as InfoPage, sha: meta.text.sha256 });
  }

  // 3. Download new/changed images before touching the database, so a failed
  //    download aborts the whole update and retries next time.
  const wantedImages = new Set<string>();
  for (const meta of Object.values(manifest.stories)) {
    if (meta.image) wantedImages.add(meta.image.path);
  }
  // Video posters are mirrored into content/images too; without this they
  // would never arrive over the air and the Videos tab would show blanks.
  for (const meta of Object.values(manifest.videos ?? {})) {
    if (meta.poster) wantedImages.add(meta.poster.path);
  }
  imagesDir.create({ intermediates: true, idempotent: true });
  for (const relPath of wantedImages) {
    const file = new File(imagesDir, relPath.replace(/^images\//, ''));
    // Image filenames are content-hashes, so existing = current.
    if (file.exists) continue;
    if (!isBundledImage(relPath)) {
      await File.downloadFileAsync(new URL(relPath, base).toString(), file, { idempotent: true });
    }
  }

  // 4. Apply everything in one transaction: story rows, order refresh,
  //    static pages, collections, deletions.
  db.withTransactionSync(() => {
    for (const { body, sha } of changed) upsertStory(body, sha);

    // Order/crossKey can change without the story text changing.
    for (const meta of Object.values(manifest.stories)) {
      db.runSync(
        'UPDATE stories SET ord = ?, crossKey = ? WHERE id = ?',
        meta.order, meta.crossKey, meta.id,
      );
    }

    // Remove stories that disappeared from the site.
    const manifestIds = new Set(Object.keys(manifest.stories));
    for (const [id] of localShas) {
      if (!manifestIds.has(id)) {
        db.runSync('DELETE FROM stories WHERE id = ?', id);
        db.runSync('DELETE FROM progress WHERE storyId = ?', id);
        // Downloaded audio for a removed story is deleted with its record.
        const dl = db.getFirstSync<{ localUri: string }>(
          'SELECT localUri FROM audio_downloads WHERE storyId = ?', id,
        );
        if (dl) {
          const f = new File(dl.localUri);
          if (f.exists) f.delete();
          db.runSync('DELETE FROM audio_downloads WHERE storyId = ?', id);
        }
      }
    }

    for (const { page, sha } of changedPages) upsertPage(page, sha);

    // Drop a static page the site no longer publishes.
    const manifestPageIds = new Set(Object.keys(manifest.pages));
    for (const row of db.getAllSync<{ id: string }>('SELECT id FROM pages')) {
      if (!manifestPageIds.has(row.id)) deletePage(row.id);
    }

    for (const col of manifest.collections) {
      for (const l of col.languages) {
        db.runSync(
          'INSERT OR REPLACE INTO collections(id, lang, title, storyIds) VALUES(?,?,?,?)',
          col.id, l.lang, col.title, JSON.stringify(l.storyIds),
        );
      }
    }

    // Videos carry no separate body file, so there is nothing to fetch or
    // hash-compare — write them straight from the manifest.
    const manifestVideos = manifest.videos ?? {};
    for (const meta of Object.values(manifestVideos)) upsertVideo(meta);

    // Drop videos the pipeline no longer publishes, taking any downloaded
    // file with them so storage does not leak.
    const manifestVideoIds = new Set(Object.keys(manifestVideos));
    for (const row of db.getAllSync<{ id: string }>('SELECT id FROM videos')) {
      if (manifestVideoIds.has(row.id)) continue;
      const dl = db.getFirstSync<{ localUri: string }>(
        'SELECT localUri FROM video_downloads WHERE videoId = ?', row.id,
      );
      if (dl) {
        const f = new File(dl.localUri);
        if (f.exists) f.delete();
        db.runSync('DELETE FROM video_downloads WHERE videoId = ?', row.id);
      }
      deleteVideoRow(row.id);
    }
  });
}

// The bundled-image require map ships with the binary; anything in it never
// needs downloading. Imported lazily to keep this module testable.
let bundledPaths: Set<string> | null = null;
function isBundledImage(relPath: string): boolean {
  if (!bundledPaths) {
    const { bundledImages } = require('../content/bundled-images') as {
      bundledImages: Record<string, number>;
    };
    bundledPaths = new Set(Object.keys(bundledImages));
  }
  return bundledPaths.has(relPath);
}
