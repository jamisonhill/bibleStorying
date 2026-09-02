// Tests for the content/images garbage collector.
//
// The collector deletes unreferenced files so the bundle does not grow every
// time a cloth image is replaced on the website. It must never delete a file
// it did not create: content/ is generated, but people do drop things there
// (high-resolution cloth art, for one), and losing them silently is worse than
// carrying a stray file.

import test from 'node:test';
import assert from 'node:assert/strict';
import { isMirroredImage } from './build.ts';

test('recognises its own mirrored output', () => {
  // mirrorImage writes `${sha256(webp).slice(0, 16)}.webp`.
  assert.equal(isMirroredImage('06c0759e9b75a391.webp'), true);
  assert.equal(isMirroredImage('151b01315f5ef430.webp'), true);
});

test('leaves hand-added files alone', () => {
  // The three cloth images that a previous build would have deleted.
  assert.equal(isMirroredImage('Story Cloth 1 HiRes.jpg'), false);
  assert.equal(isMirroredImage('Sonship Cloth 2025 JPEG.jpg'), false);
  assert.equal(isMirroredImage('Acts_Kanga_cmyk.jpg'), false);
  assert.equal(isMirroredImage('.DS_Store'), false);
  assert.equal(isMirroredImage('notes.txt'), false);
});

test('is strict about the hash shape', () => {
  // A webp that is not ours: wrong length, wrong alphabet, or decorated.
  assert.equal(isMirroredImage('06c0759e9b75a39.webp'), false, '15 chars');
  assert.equal(isMirroredImage('06c0759e9b75a3911.webp'), false, '17 chars');
  assert.equal(isMirroredImage('06C0759E9B75A391.webp'), false, 'uppercase hex');
  assert.equal(isMirroredImage('06c0759e9b75a39z.webp'), false, 'non-hex character');
  assert.equal(isMirroredImage('my-06c0759e9b75a391.webp'), false, 'prefixed');
  assert.equal(isMirroredImage('06c0759e9b75a391.webp.bak'), false, 'suffixed');
  assert.equal(isMirroredImage('06c0759e9b75a391.jpg'), false, 'wrong extension');
});
