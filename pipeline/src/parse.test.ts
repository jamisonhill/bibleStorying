// Parser tests against real saved pages from biblestoryingkenya.com.
// If the site's markup changes, these fixtures should be refreshed from the
// live site and the parsers updated together.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseNav, parseIndexPage, parseStoryPage, parseStaticPage } from './parse.ts';

const fixtures = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../test/fixtures');
const load = (name: string) => fs.readFile(path.join(fixtures, name), 'utf8');

test('parseNav discovers all collection index pages from the homepage', async () => {
  const found = parseNav(await load('home.html'));
  // 3 collections: CBS (4 langs) + Sonship (4) + Acts (2) = 10 index pages.
  assert.equal(found.length, 10);
  const cbsEn = found.find((f) => f.collectionId === 'cbs' && f.langCode === 'en');
  assert.ok(cbsEn?.url.endsWith('/cbs-stories/english-stories.html'));
  assert.equal(found.filter((f) => f.collectionId === 'sonship').length, 4);
  assert.equal(found.filter((f) => f.collectionId === 'acts').length, 2);
});

test('parseIndexPage returns the ordered story grid with card images', async () => {
  const entries = parseIndexPage(await load('idx_en.html'));
  assert.equal(entries.length, 45);
  assert.equal(entries[0].title, 'Creation of Angels');
  assert.ok(entries[0].url.endsWith('/cbs-stories/english-stories/creation-of-angels.html'));
  assert.ok(entries[0].imageUrl?.includes('cloth_art/bsk_1.jpg'));
});

test('parseIndexPage returns empty list for placeholder language pages', async () => {
  assert.equal(parseIndexPage(await load('sonship_ma.html')).length, 0);
});

test('parseStoryPage extracts title, scripture, text, image, audio, doc', async () => {
  const url = 'https://www.biblestoryingkenya.com/cbs-stories/english-stories/satan-tests-jesus.html';
  const story = parseStoryPage(await load('story.html'), url);
  assert.equal(story.title, 'Satan Tests Jesus');
  assert.equal(story.scriptureRef, 'Matthew 4:1-11, Luke 4:1-13');
  assert.equal(story.paragraphs.length, 8);
  // Entities must be decoded to real punctuation.
  assert.ok(story.paragraphs[0].includes('that’s between Jerusalem and Jericho'));
  assert.ok(story.imageUrl?.includes('cloth_art/bsk_28.jpg'));
  // Spaces in filenames must be percent-encoded exactly once.
  assert.ok(story.audioUrl?.endsWith('/assets/files/audio/en/Story%2028%20B%20%20-%20SATAN%20TESTING%20JESUS.MP3'));
  assert.ok(story.docUrl?.endsWith('/assets/files/read/en/28B-satan%20tests%20Jesus.docx'));
});

test('parseStaticPage extracts readable paragraphs', async () => {
  const page = parseStaticPage(await load('home.html'), 'https://www.biblestoryingkenya.com/');
  assert.ok(page.paragraphs.length > 0);
});
