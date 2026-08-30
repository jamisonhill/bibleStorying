// HTML parsing for the three page types on biblestoryingkenya.com:
// the homepage nav (to discover section index URLs), collection index
// pages (ordered story grids), and individual story pages.

import * as cheerio from 'cheerio';
import { SITE_BASE, COLLECTIONS, LANGUAGES } from './config.ts';

/** Resolve a (possibly relative, possibly space-containing) site link. */
export function absUrl(href: string): string {
  // The site uses relative hrefs like "cbs-stories/foo.html" and
  // percent-unsafe filenames like "Story 28 B - ....MP3"; encodeURI keeps
  // already-encoded sequences intact while fixing raw spaces.
  return encodeURI(decodeURI(new URL(href, SITE_BASE).toString()));
}

export interface DiscoveredIndex {
  collectionId: string;
  collectionTitle: string;
  langCode: string;
  url: string;
}

/**
 * Read the top nav on any page and return every collection→language index
 * page. This survives the site builder renaming files (english-stories2.html
 * etc.) because we follow the menu exactly like a visitor would.
 */
export function parseNav(html: string): DiscoveredIndex[] {
  const $ = cheerio.load(html);
  const found: DiscoveredIndex[] = [];

  $('header nav > ul > li').each((_, li) => {
    const topLabel = $(li).children('a').first().text().replace(/\s+/g, ' ').trim();
    const collection = COLLECTIONS[topLabel];
    if (!collection) return; // Home / About / Donate — not story collections

    $(li)
      .find('ul.dropdown-menu a')
      .each((_, a) => {
        const label = $(a).text().toLowerCase();
        const href = $(a).attr('href');
        if (!href) return;
        // Match "English Stories", "Swahili Stories", … to a language code.
        const langKey = Object.keys(LANGUAGES).find((k) => label.includes(k));
        if (!langKey) return;
        found.push({
          collectionId: collection.id,
          collectionTitle: collection.title,
          langCode: LANGUAGES[langKey].code,
          url: absUrl(href),
        });
      });
  });

  if (found.length === 0) {
    throw new Error('Nav parse found no collection index pages — site structure changed?');
  }
  return found;
}

export interface IndexEntry {
  url: string;
  title: string;
  /** Card artwork from the story grid, absolute URL (may be null). */
  imageUrl: string | null;
}

/**
 * Parse a collection index page's story grid (`.stories .outer` cards) into
 * an ordered list. An empty list is valid — some language pages are
 * placeholders until the site adds stories.
 */
export function parseIndexPage(html: string): IndexEntry[] {
  const $ = cheerio.load(html);
  const entries: IndexEntry[] = [];

  $('.stories .outer > a').each((_, a) => {
    const href = $(a).attr('href');
    if (!href) return;
    const title = $(a).find('.storytitle').text().replace(/\s+/g, ' ').trim();
    // Card artwork lives in an inline background-image style.
    const style = $(a).find('.storybx').attr('style') ?? '';
    const match = style.match(/background-image:\s*url\(([^)]+)\)/i);
    const imageUrl = match ? absUrl(match[1].trim().replace(/^['"]|['"]$/g, '')) : null;
    entries.push({ url: absUrl(href), title, imageUrl });
  });

  return entries;
}

export interface ParsedStoryPage {
  title: string;
  scriptureRef: string;
  paragraphs: string[];
  /** Cloth-art image from the story body, absolute URL (may be null). */
  imageUrl: string | null;
  audioUrl: string | null;
  docUrl: string | null;
}

/**
 * Parse one story page. Throws with a descriptive message when required
 * pieces (title, story text) are missing so the build fails loudly instead
 * of publishing a gutted story.
 */
export function parseStoryPage(html: string, pageUrl: string): ParsedStoryPage {
  const $ = cheerio.load(html);
  const cont = $('.storycont');
  if (cont.length === 0) throw new Error(`No .storycont on ${pageUrl}`);

  const title = cont.find('h3').first().text().replace(/\s+/g, ' ').trim();
  if (!title) throw new Error(`No story title (h3) on ${pageUrl}`);
  const scriptureRef = cont.find('h4').first().text().replace(/\s+/g, ' ').trim();

  // Story text: every non-empty <p> inside .storycont.
  const paragraphs: string[] = [];
  cont.find('p').each((_, p) => {
    const text = $(p).text().replace(/\s+/g, ' ').trim();
    if (text) paragraphs.push(text);
  });
  // Note: a few stories are audio/document-only with no text on the site —
  // an empty paragraphs list is allowed here; build.ts requires that at
  // least one of text/audio/doc exists before publishing.

  // Cloth art: inline background-image on .clothart.
  const clothStyle = cont.find('.clothart').attr('style') ?? '';
  const clothMatch = clothStyle.match(/background-image:\s*url\(([^)]+)\)/i);
  const imageUrl = clothMatch ? absUrl(clothMatch[1].trim().replace(/^['"]|['"]$/g, '')) : null;

  // Audio + downloadable document live in the .linkbar section.
  const linkbar = $('.linkbar');
  const audioSrc = linkbar.find('audio source').attr('src') ?? null;
  let docUrl: string | null = null;
  linkbar.find('a[download], a[href*="assets/files/read/"]').each((_, a) => {
    const href = $(a).attr('href') ?? '';
    if (/\.(pdf|docx?)$/i.test(href) && /assets\/files\/read\//i.test(href) && !docUrl) {
      docUrl = absUrl(href);
    }
  });

  return {
    title,
    scriptureRef,
    paragraphs,
    imageUrl,
    audioUrl: audioSrc ? absUrl(audioSrc) : null,
    docUrl,
  };
}

/** Parse a static page (About CBS): title + all article paragraphs. */
export function parseStaticPage(html: string, pageUrl: string): { title: string; paragraphs: string[] } {
  const $ = cheerio.load(html);
  const title = $('.bannertitle h1').first().text().replace(/\s+/g, ' ').trim() || $('title').text().split('-')[0].trim();
  const paragraphs: string[] = [];
  $('article p, article li').each((_, el) => {
    // Skip nav/footer paragraphs by requiring the element to be outside them.
    if ($(el).closest('header, footer, .linkbar').length > 0) return;
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text && text.length > 2) paragraphs.push(text);
  });
  if (paragraphs.length === 0) throw new Error(`No content paragraphs on ${pageUrl}`);
  return { title, paragraphs };
}

/** Extract the sitemap's URL → lastmod map. */
export function parseSitemap(xml: string): Map<string, string> {
  const $ = cheerio.load(xml, { xml: true });
  const map = new Map<string, string>();
  $('url').each((_, u) => {
    const loc = $(u).find('loc').text().trim();
    const lastmod = $(u).find('lastmod').text().trim();
    if (loc) map.set(encodeURI(decodeURI(loc)), lastmod);
  });
  if (map.size === 0) throw new Error('Sitemap parse produced zero URLs');
  return map;
}
