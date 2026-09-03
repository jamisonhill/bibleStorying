// SQLite storage: all story content lives here so every screen works with
// the network off. First launch imports the bundled seed; afterwards the
// updater applies over-the-air content changes into the same tables.

import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import seed from '../content/seed.json';
import type {
  CollectionId, CollectionLang, InfoPage, LangCode, Manifest, Story, StoryBody, Video,
} from './types';

export const db: SQLiteDatabase = openDatabaseSync('content.db');

/** Create tables and import the bundled seed once. Called before first render. */
export function initDatabase(): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS stories(
      id TEXT PRIMARY KEY,
      collection TEXT NOT NULL,
      lang TEXT NOT NULL,
      ord INTEGER NOT NULL,
      crossKey TEXT NOT NULL,
      title TEXT NOT NULL,
      scriptureRef TEXT NOT NULL DEFAULT '',
      paragraphs TEXT NOT NULL,
      imagePath TEXT,
      imageSha TEXT,
      audioUrl TEXT,
      audioBytes INTEGER,
      docUrl TEXT,
      docBytes INTEGER,
      docKind TEXT,
      textSha TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_stories_list ON stories(collection, lang, ord);
    CREATE TABLE IF NOT EXISTS collections(
      id TEXT NOT NULL,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      storyIds TEXT NOT NULL,
      PRIMARY KEY(id, lang)
    );
    CREATE TABLE IF NOT EXISTS pages(
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      paragraphs TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audio_downloads(
      storyId TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      bytes INTEGER NOT NULL,
      localUri TEXT NOT NULL,
      downloadedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS videos(
      id TEXT PRIMARY KEY,
      ord INTEGER NOT NULL,
      title TEXT NOT NULL,
      durationSec INTEGER NOT NULL,
      posterPath TEXT,
      posterSha TEXT,
      url TEXT NOT NULL,
      bytes INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS video_downloads(
      videoId TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      bytes INTEGER NOT NULL,
      localUri TEXT NOT NULL,
      downloadedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS progress(
      storyId TEXT PRIMARY KEY,
      positionSec REAL NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Seed only when the database is empty (fresh install). A reinstalled app
  // with a newer bundled seed than the stored content also re-imports.
  const stored = getMetaNumber('contentVersion');
  const bundled = (seed.manifest as Manifest).contentVersion;
  if (stored === null || bundled > stored) {
    importSeed();
  }
}

function importSeed(): void {
  const manifest = seed.manifest as Manifest;
  const stories = seed.stories as Record<string, StoryBody>;
  const pages = seed.pages as Record<string, InfoPage>;

  db.withTransactionSync(() => {
    for (const body of Object.values(stories)) upsertStory(body, manifest.stories[body.id].text.sha256);
    for (const page of Object.values(pages)) {
      upsertPage(page, manifest.pages[page.id].text.sha256);
    }
    for (const col of manifest.collections) {
      for (const l of col.languages) {
        db.runSync(
          'INSERT OR REPLACE INTO collections(id, lang, title, storyIds) VALUES(?,?,?,?)',
          col.id, l.lang, col.title, JSON.stringify(l.storyIds),
        );
      }
    }
    // `videos` is absent from bundles published before the Videos tab existed.
    for (const v of Object.values(manifest.videos ?? {})) upsertVideo(v);
    setMeta('contentVersion', String(manifest.contentVersion));
  });
}

/** Insert or update one story row (used by both seeding and OTA updates). */
export function upsertStory(body: StoryBody, textSha: string): void {
  db.runSync(
    `INSERT OR REPLACE INTO stories(
      id, collection, lang, ord, crossKey, title, scriptureRef, paragraphs,
      imagePath, imageSha, audioUrl, audioBytes, docUrl, docBytes, docKind, textSha
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    body.id, body.collection, body.lang, body.order, body.crossKey, body.title,
    body.scriptureRef, JSON.stringify(body.paragraphs),
    body.image?.path ?? null, body.image?.sha256 ?? null,
    body.audio?.url ?? null, body.audio?.bytes ?? null,
    body.doc?.url ?? null, body.doc?.bytes ?? null, body.doc?.kind ?? null,
    textSha,
  );
}

/**
 * Insert or update one static info page (used by both seeding and OTA
 * updates). The pages table carries no hash column, so the body's SHA-256 is
 * remembered in `meta` under `pageSha:<id>` — that is what lets the updater
 * skip re-downloading a page whose text has not changed.
 */
export function upsertPage(page: InfoPage, textSha: string): void {
  db.runSync(
    'INSERT OR REPLACE INTO pages(id, title, paragraphs) VALUES(?,?,?)',
    page.id, page.title, JSON.stringify(page.paragraphs),
  );
  setMeta(pageShaKey(page.id), textSha);
}

/** Remove a static page that has disappeared from the published manifest. */
export function deletePage(id: string): void {
  db.runSync('DELETE FROM pages WHERE id = ?', id);
  db.runSync('DELETE FROM meta WHERE key = ?', pageShaKey(id));
}

/** meta key holding the SHA-256 of a page's published JSON body. */
export function pageShaKey(id: string): string {
  return `pageSha:${id}`;
}

interface StoryRow {
  id: string; collection: string; lang: string; ord: number; crossKey: string;
  title: string; scriptureRef: string; paragraphs: string;
  imagePath: string | null; imageSha: string | null;
  audioUrl: string | null; audioBytes: number | null;
  docUrl: string | null; docBytes: number | null; docKind: string | null;
  textSha: string;
}

function rowToStory(row: StoryRow): Story {
  return {
    id: row.id,
    collection: row.collection as CollectionId,
    lang: row.lang as LangCode,
    order: row.ord,
    crossKey: row.crossKey,
    title: row.title,
    scriptureRef: row.scriptureRef,
    paragraphs: JSON.parse(row.paragraphs) as string[],
    imagePath: row.imagePath,
    imageSha: row.imageSha,
    audio: row.audioUrl && row.audioBytes ? { url: row.audioUrl, bytes: row.audioBytes } : null,
    doc: row.docUrl && row.docBytes && row.docKind
      ? { url: row.docUrl, bytes: row.docBytes, kind: row.docKind }
      : null,
    textSha: row.textSha,
  };
}

export function getStory(id: string): Story | null {
  const row = db.getFirstSync<StoryRow>('SELECT * FROM stories WHERE id = ?', id);
  return row ? rowToStory(row) : null;
}

export function getStoriesFor(collection: CollectionId, lang: LangCode): Story[] {
  const rows = db.getAllSync<StoryRow>(
    'SELECT * FROM stories WHERE collection = ? AND lang = ? ORDER BY ord',
    collection, lang,
  );
  return rows.map(rowToStory);
}

/** The same story in another language, via the shared crossKey. */
export function getTranslation(story: Story, lang: LangCode): Story | null {
  const row = db.getFirstSync<StoryRow>(
    'SELECT * FROM stories WHERE collection = ? AND crossKey = ? AND lang = ?',
    story.collection, story.crossKey, lang,
  );
  return row ? rowToStory(row) : null;
}

/** Which languages have content, per collection (drives the language chips). */
export function getCollections(): CollectionLang[] {
  const rows = db.getAllSync<{ id: string; lang: string; title: string; storyIds: string }>(
    'SELECT * FROM collections',
  );
  return rows.map((r) => ({
    id: r.id as CollectionId,
    lang: r.lang as LangCode,
    title: r.title,
    storyIds: JSON.parse(r.storyIds) as string[],
  }));
}

export function getPage(id: string): InfoPage | null {
  const row = db.getFirstSync<{ id: string; title: string; paragraphs: string }>(
    'SELECT * FROM pages WHERE id = ?', id,
  );
  return row ? { id: row.id, title: row.title, paragraphs: JSON.parse(row.paragraphs) } : null;
}

// --- videos ---

/** Insert or update one video row (used by both seeding and OTA updates). */
export function upsertVideo(entry: NonNullable<Manifest['videos']>[string]): void {
  db.runSync(
    `INSERT OR REPLACE INTO videos(
      id, ord, title, durationSec, posterPath, posterSha, url, bytes
    ) VALUES(?,?,?,?,?,?,?,?)`,
    entry.id, entry.order, entry.title, entry.durationSec,
    entry.poster?.path ?? null, entry.poster?.sha256 ?? null,
    entry.file.url, entry.file.bytes,
  );
}

/** Remove a video that has disappeared from the published manifest. */
export function deleteVideoRow(id: string): void {
  db.runSync('DELETE FROM videos WHERE id = ?', id);
}

interface VideoRow {
  id: string; ord: number; title: string; durationSec: number;
  posterPath: string | null; posterSha: string | null;
  url: string; bytes: number;
}

function rowToVideo(row: VideoRow): Video {
  return {
    id: row.id,
    title: row.title,
    order: row.ord,
    durationSec: row.durationSec,
    posterPath: row.posterPath,
    posterSha: row.posterSha,
    file: { url: row.url, bytes: row.bytes },
  };
}

/** Every video, in the order set by videos.json. Drives the Videos tab. */
export function getVideos(): Video[] {
  return db.getAllSync<VideoRow>('SELECT * FROM videos ORDER BY ord').map(rowToVideo);
}

export function getVideo(id: string): Video | null {
  const row = db.getFirstSync<VideoRow>('SELECT * FROM videos WHERE id = ?', id);
  return row ? rowToVideo(row) : null;
}

// --- meta key/value helpers (settings, versions, timestamps) ---

export function getMeta(key: string): string | null {
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM meta WHERE key = ?', key);
  return row?.value ?? null;
}

export function getMetaNumber(key: string): number | null {
  const v = getMeta(key);
  return v === null ? null : Number(v);
}

export function setMeta(key: string, value: string): void {
  db.runSync('INSERT OR REPLACE INTO meta(key, value) VALUES(?,?)', key, value);
}

// --- playback progress (resume where you left off) ---

export function getProgress(storyId: string): number {
  const row = db.getFirstSync<{ positionSec: number }>(
    'SELECT positionSec FROM progress WHERE storyId = ?', storyId,
  );
  return row?.positionSec ?? 0;
}

export function setProgress(storyId: string, positionSec: number): void {
  db.runSync(
    'INSERT OR REPLACE INTO progress(storyId, positionSec, updatedAt) VALUES(?,?,?)',
    storyId, positionSec, new Date().toISOString(),
  );
}
