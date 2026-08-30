// Central configuration for the content pipeline.
// The pipeline crawls biblestoryingkenya.com and produces a versioned,
// offline-ready content bundle in ../content that the mobile app consumes.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Root of the live website. Every relative link on the site resolves against this. */
export const SITE_BASE = 'https://www.biblestoryingkenya.com/';

/** Where the generated content bundle is written (committed to the repo). */
export const CONTENT_DIR = path.resolve(here, '../../content');

/** Crawl state (per-URL lastmod stamps, content version) lives inside the bundle
 *  so a fresh checkout of the repo can do an incremental build. */
export const STATE_FILE = path.join(CONTENT_DIR, 'state.json');

/**
 * The three story collections, keyed by the exact label of their top-level
 * nav menu item on the website. The per-language index pages are DISCOVERED
 * from the nav dropdowns at crawl time (the site builder renames files like
 * "english-stories2.html", so hardcoding URLs would eventually break).
 */
export const COLLECTIONS: Record<string, { id: string; title: string }> = {
  'CBS Stories': { id: 'cbs', title: 'CBS Stories' },
  'Sonship Stories': { id: 'sonship', title: 'Sonship Stories' },
  'Book of Acts': { id: 'acts', title: 'Book of Acts' },
};

/** Map the nav label of a language sub-page to a stable language code. */
export const LANGUAGES: Record<string, { code: string; name: string; localName: string }> = {
  english: { code: 'en', name: 'English', localName: 'English' },
  swahili: { code: 'sw', name: 'Swahili', localName: 'Kiswahili' },
  maasai: { code: 'ma', name: 'Maasai', localName: 'Maa' },
  borana: { code: 'br', name: 'Borana', localName: 'Borana' },
};

/** Standalone informational pages bundled for the app's About section. */
export const STATIC_PAGES = [
  { id: 'about-cbs', url: 'about-cbs.html', title: 'About CBS' },
];

/** Images are resized to this max width and re-encoded as WebP. */
export const IMAGE_MAX_WIDTH = 1200;
export const IMAGE_WEBP_QUALITY = 75;

/** Polite crawling: parallel fetches capped, and a browser-ish UA. */
export const FETCH_CONCURRENCY = 6;
export const USER_AGENT =
  'BibleStoryingKenyaApp-ContentPipeline/1.0 (+https://biblestoryingkenya.com)';
