// Tests for the hand-maintained videos.json loader.
//
// videos.json is edited by hand, so it carries the same drift risk as the
// website markup: a typo'd slug or a duplicated order would not crash the
// build, it would quietly ship a Videos tab in the wrong order or with an
// entry missing. These tests pin the validation that turns that into a
// loud failure, and check the real config still parses.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseVideosConfig, loadVideosConfig } from './videos.ts';
import { VIDEOS_CONFIG } from './config.ts';

/** A minimal valid entry; individual tests override single fields. */
const entry = (over: Record<string, unknown> = {}) => ({
  slug: 'cbs-and-sbs-overview',
  title: 'CBS and SBS Overview',
  order: 1,
  durationSec: 354,
  bytes: 43788616,
  poster: 'cbs-and-sbs-overview.webp',
  url: 'https://www.biblestoryingkenya.com/assets/files/video/cbs-and-sbs-overview.mp4',
  ...over,
});

test('accepts a valid config and returns it in order', () => {
  const videos = parseVideosConfig({
    videos: [
      entry({ slug: 'third', order: 3 }),
      entry({ slug: 'first', order: 1 }),
      entry({ slug: 'second', order: 2 }),
    ],
  });
  assert.deepEqual(videos.map((v) => v.slug), ['first', 'second', 'third']);
});

test('rejects a duplicate slug', () => {
  // Two entries with one id would silently collapse into a single manifest key.
  assert.throws(
    () => parseVideosConfig({ videos: [entry({ order: 1 }), entry({ order: 2 })] }),
    /duplicate slug/,
  );
});

test('rejects a duplicate order', () => {
  // Ties make the Videos tab's ordering arbitrary rather than wrong-but-stable.
  assert.throws(
    () => parseVideosConfig({ videos: [entry({ slug: 'a' }), entry({ slug: 'b' })] }),
    /both claim order 1/,
  );
});

test('rejects malformed entries', () => {
  assert.throws(() => parseVideosConfig({ videos: [entry({ slug: 'Has Capitals' })] }), 'slug charset');
  assert.throws(() => parseVideosConfig({ videos: [entry({ bytes: 0 })] }), 'zero bytes');
  assert.throws(() => parseVideosConfig({ videos: [entry({ durationSec: -1 })] }), 'negative duration');
  assert.throws(() => parseVideosConfig({ videos: [entry({ url: 'not-a-url' })] }), 'relative url');
  assert.throws(() => parseVideosConfig({ videos: [entry({ title: '' })] }), 'empty title');
  assert.throws(() => parseVideosConfig({ videos: [{ slug: 'only-a-slug' }] }), 'missing fields');
});

test('an absent config means no videos, not a failure', async () => {
  // A checkout without videos.json is valid; the app simply shows none.
  assert.deepEqual(await loadVideosConfig('/nonexistent/videos.json'), []);
});

test('the committed videos.json is valid', async () => {
  const videos = await loadVideosConfig(VIDEOS_CONFIG);
  assert.ok(videos.length > 0, 'expected at least one video');
  // Every declared poster must exist, or the build throws far from the cause.
  for (const video of videos) {
    const poster = new URL(`../video-posters/${video.poster}`, import.meta.url);
    assert.ok(fs.existsSync(poster), `missing poster for ${video.slug}: ${video.poster}`);
  }
});
