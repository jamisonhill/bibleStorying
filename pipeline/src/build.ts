// Build orchestrator: crawls the site, parses every story, mirrors images
// (resized WebP), and writes the versioned content bundle to ../content.
//
// Incremental: pages whose sitemap <lastmod> is unchanged are reused from the
// existing bundle instead of re-fetched. Run with --full to force a complete
// re-crawl (recommended monthly, in case the site stops updating lastmod).
//
// Usage:  node src/build.ts [--full]

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {
  SITE_BASE, CONTENT_DIR, STATE_FILE, STATIC_PAGES,
  IMAGE_MAX_WIDTH, IMAGE_WEBP_QUALITY, COLLECTIONS,
} from './config.ts';
import { fetchText, fetchBytes, headBytes } from './fetch.ts';
import {
  parseNav, parseIndexPage, parseStoryPage, parseStaticPage, parseSitemap,
} from './parse.ts';
import {
  StorySchema, PageSchema, ManifestSchema, StateSchema,
  type Story, type Page, type Manifest, type State,
} from './schema.ts';

const FULL_CRAWL = process.argv.includes('--full');

const sha256 = (buf: Buffer | string) => crypto.createHash('sha256').update(buf).digest('hex');

/** Load prior crawl state, or start fresh on first run / corrupted state. */
async function loadState(): Promise<State> {
  try {
    const raw = JSON.parse(await fs.readFile(STATE_FILE, 'utf8'));
    return StateSchema.parse(raw);
  } catch {
    return { contentVersion: 0, pageLastmod: {}, remoteBytes: {} };
  }
}

/** Load the previously published story JSON for reuse, or null. */
async function loadExistingStory(id: string): Promise<Story | null> {
  try {
    const raw = JSON.parse(await fs.readFile(path.join(CONTENT_DIR, 'stories', `${id.replaceAll('/', '__')}.json`), 'utf8'));
    return StorySchema.parse(raw);
  } catch {
    return null;
  }
}

/** Cached HEAD lookup for remote file sizes (audio/docs stay on the site). */
async function remoteFile(url: string, state: State, refresh: boolean) {
  if (!refresh && state.remoteBytes[url]) return { url, bytes: state.remoteBytes[url] };
  const bytes = await headBytes(url);
  if (bytes == null) return null; // broken link on the site — publish without it
  state.remoteBytes[url] = bytes;
  return { url, bytes };
}

/**
 * Mirror an image into the bundle: download, resize to ≤1200px wide,
 * re-encode as WebP, save under its content hash. Identical source images
 * (cloth art shared across languages) dedupe automatically.
 */
async function mirrorImage(
  url: string,
  cache: Map<string, { path: string; sha256: string; bytes: number }>,
): Promise<{ path: string; sha256: string; bytes: number } | null> {
  if (cache.has(url)) return cache.get(url)!;
  let source: Buffer;
  try {
    source = await fetchBytes(url);
  } catch (err) {
    console.warn(`  ! image fetch failed, story continues without it: ${url} (${String(err)})`);
    return null;
  }
  const webp = await sharp(source)
    .resize({ width: IMAGE_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: IMAGE_WEBP_QUALITY })
    .toBuffer();
  const hash = sha256(webp);
  const rel = path.join('images', `${hash.slice(0, 16)}.webp`);
  await fs.mkdir(path.join(CONTENT_DIR, 'images'), { recursive: true });
  await fs.writeFile(path.join(CONTENT_DIR, rel), webp);
  const entry = { path: rel.replaceAll(path.sep, '/'), sha256: hash, bytes: webp.length };
  cache.set(url, entry);
  return entry;
}

/** Write a story/page JSON file and return its bundle reference. */
async function writeJson(relPath: string, data: unknown) {
  const buf = Buffer.from(JSON.stringify(data), 'utf8');
  const full = path.join(CONTENT_DIR, relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buf);
  return { path: relPath.replaceAll(path.sep, '/'), sha256: sha256(buf), bytes: buf.length };
}

async function main() {
  console.log(`Content build starting (${FULL_CRAWL ? 'FULL' : 'incremental'} crawl)…`);
  const state = await loadState();

  // 1. Sitemap: URL → lastmod, our change-detection signal.
  const sitemap = parseSitemap(await fetchText(new URL('sitemap.xml', SITE_BASE).toString()));
  console.log(`Sitemap: ${sitemap.size} URLs`);

  // 2. Discover collection index pages from the homepage nav.
  const homeHtml = await fetchText(SITE_BASE);
  const indexes = parseNav(homeHtml);
  console.log(`Nav discovery: ${indexes.length} collection/language index pages`);

  const imageCache = new Map<string, { path: string; sha256: string; bytes: number }>();
  const stories = new Map<string, Story>();
  const collections = new Map<string, { id: string; title: string; languages: { lang: string; storyIds: string[] }[] }>();
  const problems: string[] = [];

  // 3. Walk every index page, then every story it lists (in the site's order).
  for (const idx of indexes) {
    const entries = parseIndexPage(await fetchText(idx.url));
    console.log(`${idx.collectionId}/${idx.langCode}: ${entries.length} stories listed`);
    const storyIds: string[] = [];

    for (let order = 0; order < entries.length; order++) {
      const entry = entries[order];
      const slug = path.basename(new URL(entry.url).pathname, '.html').toLowerCase();
      const id = `${idx.collectionId}/${idx.langCode}/${slug}`;

      const lastmod = sitemap.get(entry.url) ?? '';
      const unchanged = !FULL_CRAWL && lastmod && state.pageLastmod[entry.url] === lastmod;
      const existing = unchanged ? await loadExistingStory(id) : null;

      try {
        let story: Story;
        if (existing) {
          // Page unchanged since last crawl — keep the published story but
          // refresh order/crossKey (list position can change independently).
          story = { ...existing, order };
        } else {
          const parsed = parseStoryPage(await fetchText(entry.url), entry.url);
          const imageUrl = parsed.imageUrl ?? entry.imageUrl;
          const image = imageUrl ? await mirrorImage(imageUrl, imageCache) : null;
          const audio = parsed.audioUrl ? await remoteFile(parsed.audioUrl, state, true) : null;
          const docRaw = parsed.docUrl ? await remoteFile(parsed.docUrl, state, true) : null;
          const docKind = parsed.docUrl?.toLowerCase().match(/\.(pdf|docx?)$/)?.[1] as 'pdf' | 'doc' | 'docx' | undefined;

          // crossKey: cloth-art number is shared across languages of the same
          // story; fall back to list position for stories without artwork.
          const clothNum = imageUrl?.match(/bsk_(\d+)\./)?.[1];
          story = StorySchema.parse({
            id,
            collection: idx.collectionId,
            lang: idx.langCode,
            slug,
            order,
            crossKey: clothNum ? `bsk_${clothNum}` : `pos_${order}`,
            title: parsed.title,
            scriptureRef: parsed.scriptureRef,
            paragraphs: parsed.paragraphs,
            image,
            audio,
            doc: docRaw && docKind ? { ...docRaw, kind: docKind } : null,
            sourceUrl: entry.url,
          });
          // A story with no text, no audio, and no document is unusable —
          // that means the page markup changed and needs human eyes.
          if (story.paragraphs.length === 0 && !story.audio && !story.doc) {
            throw new Error(`Story has no text, audio, or document: ${entry.url}`);
          }
          if (lastmod) state.pageLastmod[entry.url] = lastmod;
        }
        stories.set(id, story);
        storyIds.push(id);
      } catch (err) {
        // One bad page must not publish a broken bundle NOR silently vanish
        // from the app: record the failure and fail the build at the end.
        problems.push(`${id}: ${String(err)}`);
      }
    }

    const col = collections.get(idx.collectionId) ?? {
      id: idx.collectionId,
      title: idx.collectionTitle,
      languages: [],
    };
    col.languages.push({ lang: idx.langCode, storyIds });
    collections.set(idx.collectionId, col);
  }

  // Every collection defined in config must have been found in the nav —
  // a missing collection means the site changed and needs human eyes.
  for (const { id, title } of Object.values(COLLECTIONS)) {
    if (!collections.has(id)) problems.push(`Collection "${title}" missing from nav`);
  }
  if (problems.length > 0) {
    console.error(`\nBUILD FAILED — ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  // 4. Static pages (About CBS).
  const pages: Page[] = [];
  for (const sp of STATIC_PAGES) {
    const url = new URL(sp.url, SITE_BASE).toString();
    const parsed = parseStaticPage(await fetchText(url), url);
    pages.push(PageSchema.parse({ id: sp.id, title: sp.title, paragraphs: parsed.paragraphs, sourceUrl: url }));
  }

  // 5. Write story/page JSONs and assemble the manifest.
  const manifestStories: Manifest['stories'] = {};
  for (const story of stories.values()) {
    const text = await writeJson(path.join('stories', `${story.id.replaceAll('/', '__')}.json`), story);
    manifestStories[story.id] = {
      id: story.id,
      collection: story.collection,
      lang: story.lang,
      order: story.order,
      crossKey: story.crossKey,
      title: story.title,
      scriptureRef: story.scriptureRef,
      text,
      image: story.image,
      audio: story.audio,
      doc: story.doc,
    };
  }
  const manifestPages: Manifest['pages'] = {};
  for (const page of pages) {
    const text = await writeJson(path.join('pages', `${page.id}.json`), page);
    manifestPages[page.id] = { id: page.id, title: page.title, text };
  }

  // 6. Version bump only when the published content actually changed.
  const fingerprintInput = JSON.stringify({ stories: manifestStories, pages: manifestPages, collections: [...collections.values()] });
  const fingerprint = sha256(fingerprintInput);
  let previousFingerprint = '';
  try {
    const prev = JSON.parse(await fs.readFile(path.join(CONTENT_DIR, 'manifest.json'), 'utf8'));
    previousFingerprint = prev.fingerprint ?? '';
  } catch { /* first build */ }

  const changed = fingerprint !== previousFingerprint;
  const contentVersion = changed ? state.contentVersion + 1 : state.contentVersion || 1;
  state.contentVersion = contentVersion;

  const manifest = ManifestSchema.parse({
    schemaVersion: 1,
    contentVersion,
    generatedAt: new Date().toISOString(),
    collections: [...collections.values()],
    stories: manifestStories,
    pages: manifestPages,
  });
  await fs.writeFile(
    path.join(CONTENT_DIR, 'manifest.json'),
    JSON.stringify({ ...manifest, fingerprint }, null, 1),
  );
  await fs.writeFile(STATE_FILE, JSON.stringify(StateSchema.parse(state), null, 1));

  // 7. Garbage-collect images no longer referenced by any story.
  const referenced = new Set(
    [...stories.values()].flatMap((s) => (s.image ? [path.basename(s.image.path)] : [])),
  );
  try {
    for (const file of await fs.readdir(path.join(CONTENT_DIR, 'images'))) {
      if (!referenced.has(file)) await fs.rm(path.join(CONTENT_DIR, 'images', file));
    }
  } catch { /* no images dir yet */ }

  const totalAudio = [...stories.values()].reduce((sum, s) => sum + (s.audio?.bytes ?? 0), 0);
  console.log(`\nDone. contentVersion=${contentVersion} (${changed ? 'CHANGED' : 'unchanged'})`);
  console.log(`Stories: ${stories.size}  Pages: ${pages.length}  Images: ${imageCache.size} mirrored`);
  console.log(`Remote audio total: ${(totalAudio / 1e6).toFixed(0)} MB (stays on the website)`);
}

main().catch((err) => {
  console.error('BUILD FAILED:', err);
  process.exit(1);
});
