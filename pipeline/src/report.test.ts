// Tests for the crossKey audit heuristics.
//
// These functions decide whether two pages in different languages are really
// the same story, using the one part of a scripture reference that survives
// translation: the chapter and verse numbers.

import test from 'node:test';
import assert from 'node:assert/strict';
import { scriptureFingerprint, disjoint, splitByAgreement } from './report.ts';
import type { Story } from './schema.ts';

/** Minimal Story stub — the audit only reads lang and scriptureRef. */
function story(lang: string, scriptureRef: string): Story {
  return {
    id: `cbs/${lang}/x`,
    collection: 'cbs',
    lang,
    slug: 'x',
    order: 0,
    crossKey: 'bsk_1',
    title: 'x',
    scriptureRef,
    paragraphs: ['x'],
    image: null,
    audio: null,
    doc: null,
    sourceUrl: 'https://www.biblestoryingkenya.com/x.html',
  } as Story;
}

test('fingerprint keeps chapter/verse numbers and ignores the book name', () => {
  assert.deepEqual([...scriptureFingerprint('Matthew 4:1-11')], ['4', '1', '11']);
  // Same story, three languages — the numbers line up even though names differ.
  assert.deepEqual([...scriptureFingerprint('Matayo 4:1-11')], ['4', '1', '11']);
  assert.deepEqual([...scriptureFingerprint('Mwanzo 3')], ['3']);
  // Song/drama pages carry no reference at all.
  assert.equal(scriptureFingerprint('Kara Faaruutifi Diraamatini').size, 0);
});

test('an empty fingerprint is never treated as disagreement', () => {
  // A page that cites nothing is silent, not contradictory.
  assert.equal(disjoint(scriptureFingerprint(''), scriptureFingerprint('Genesis 2')), false);
});

test('disjoint is true only when no number is shared', () => {
  assert.equal(disjoint(scriptureFingerprint('Exodus 7-11'), scriptureFingerprint('Enaidurra 3-4')), true);
  assert.equal(disjoint(scriptureFingerprint('Genesis 13, 15'), scriptureFingerprint('Uumama 15')), false);
});

test('agreeing translations produce no dissenters', () => {
  const { dissenters } = splitByAgreement([
    story('en', 'Matthew 4:1-11, Luke 4:1-13'),
    story('sw', 'Matayo 4:1-11, Luka 4:1-13'),
    story('ma', 'Matayo 4:1-11'),
  ]);
  assert.deepEqual(dissenters, []);
});

test('the odd page out is named, not an arbitrary pair', () => {
  // Real case bsk_22: three languages say Judges, Maasai says 1 Samuel 15.
  const { majority, dissenters } = splitByAgreement([
    story('en', 'Joshua 7-28, Judges'),
    story('br', 'Yoshua 7-28, Jaalaboota'),
    story('sw', 'Yoshua 7-28; Waamuzi'),
    story('ma', '1 Samueli 15:1-23'),
  ]);
  assert.equal(majority.length, 3);
  assert.deepEqual(dissenters.map((d) => d.lang), ['ma']);
});

test('a page citing nothing is excluded rather than flagged', () => {
  // Real case bsk_6#1: the Borana slot holds a drama/songs page with no
  // reference. It must not be reported as disagreeing — it is handled as
  // "unverifiable" by the caller instead.
  const { dissenters } = splitByAgreement([
    story('en', 'Genesis 13, 15'),
    story('br', 'Kara Faaruutifi Diraamatini Oduu Kitaaba Barsiisu Faaru:'),
  ]);
  assert.deepEqual(dissenters, []);
});

test('two pages that simply disagree yield no majority', () => {
  const { majority, dissenters } = splitByAgreement([
    story('en', 'Genesis 2'),
    story('sw', 'Mwanzo 40'),
  ]);
  assert.equal(majority.length, 1);
  assert.equal(dissenters.length, 1);
});
