// Extract story drafts from the printed Sonship / CBS curriculum PDFs.
//
// WHY THIS EXISTS
// The website is the single source of truth for the app: build.ts crawls it and
// the app only ever sees what is published there. But the printed curriculum is
// ahead of the website — the Sonship PDF carries 31 stories while the site
// publishes only the first 12. This tool turns the PDF into draft records that
// a human then creates in the Evolution CMS as UNPUBLISHED pages, for the
// client to review and publish. Once published, the normal daily crawl picks
// them up and nothing else in the pipeline has to change.
//
// It deliberately does NOT write to the CMS or to ../content. Its output is a
// staging area for review.
//
// WHAT A PUBLISHED PAGE LOOKS LIKE (matched against the 12 live pages):
//   Key Theme: ...
//   [Core Gospel Concepts: ...]
//   Context: ...            <- optional
//   <the story, with its sub-headings>
//   Optional Memory Verse: ...
// The facilitator material (introduction question, listening tasks, discussion
// and application questions) is NOT published, so it is captured separately
// rather than thrown away — the client may want it later.
//
// Requires `pdftotext` (poppler):  brew install poppler
//
// Usage:  node src/extract-pdf.ts <file.pdf> --lang=en --collection=sonship [--out=../drafts]
//         node src/extract-pdf.ts <file.pdf> --lang=en --collection=sonship --check

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

/**
 * Section markers per language.
 *
 * `story` starts the narrative, `memory` the optional memory verse, and `stop`
 * lists the facilitator sections that end the publishable part of a lesson.
 * These are explicit rather than inferred: if a future revision renames one,
 * extraction should fail loudly instead of silently truncating a story.
 */
const MARKERS: Record<string, { story: RegExp; memory: RegExp; stop: RegExp; breakBefore: RegExp }> = {
  en: {
    story: /^\s*THE\s+THE\s+STORY:|^\s*THE\s+STORY:/i,
    memory: /^\s*MEMORY\s+VERSE\s*\(optional\)\s*:?/i,
    stop: /^\s*(INTRODUCTION\s+QUESTION|TEACHER.S\s+TRANSITION|LEARN\s+STORY\s+TOGETHER|LISTENING\s+TASKS?|BASIC\s+OUTLINE|DISCUSSION\s+QUESTIONS?|GENERAL\s+APPLICATION|PERSONAL\s+APPLICATION|POST-STORY\s+DISCUSSION|EXTRA\s+READING|STORYING\s+QUESTIONS)/i,
    breakBefore: /^\s*(Key\s+Themes?\s*:|\[Core\s+Gospel\s+Concepts|Context\s*:|Introduction\s*:)/i,
  },
  // NOTE: these suit the Sonship (SbS) documents. The CBS Swahili book uses
  // a bare "UTANGULIZI:" as a section header, whereas in Sonship the same word
  // opens the lesson prose — so CBS will need its own marker set.
  sw: {
    story: /^\s*HADITHI\s*:/i,
    memory: /^\s*AYA\s+ya\s+KUKUMBUSHA/i,
    stop: /^\s*(SWALI\s+LA\s+UTANGULIZI|TAARIFA\s+YA\s+MPITO|KAULI\s+YA\s+MPITO|JIFUNZE\s+HADITHI\s+PAMOJA|MUHTASARI\s+WA\s+MSINGI|MASWALI\s+YA\s+UTEKELEZAJI|MASWALI\s+YA\s+HADITHI|MASWALI\s+KWA\s+DARASA|KUJIFUNZA\s+HADITHI)/i,
    breakBefore: /^\s*(Mada\s+(Kuu|Muhimu)\s*:|\[Dhana\s+(Kuu|Muhimu)|Muktadha\s*:|Utangulizi\s*:)/i,
  },
};

/** One extracted lesson, ready for a human to enter into the CMS. */
type Draft = {
  /** Curriculum number, 1-31. Also the cross-language link: story 5 is story 5
   *  in every language, which is far more reliable than the cloth-art guess. */
  number: number;
  lang: string;
  collection: string;
  title: string;
  /** URL alias, matching the slug style already used on the site. */
  alias: string;
  /** Goes into the CMS "Bible Verse" template variable (tv13). */
  scriptureRef: string;
  /** The publishable body, in the paragraph order the live pages use. */
  paragraphs: string[];
  /** Same body as HTML, ready to paste into the CMS rich-text field (`ta`). */
  bodyHtml: string;
  /** Facilitator-only material. Captured, not published. */
  facilitatorNotes: string[];
  /** False when the lesson had no "THE STORY:" divider — worth a human glance,
   *  because the split between preamble and narrative was inferred. */
  hadStoryMarker: boolean;
  sourcePdf: string;
};

/** A lesson the parser could not read cleanly — reported, never silently dropped. */
type Problem = { number: number | null; title: string; reason: string };

/** Google Docs exports carry zero-width spaces inside list numbering. */
const clean = (s: string) => s.replace(/[​‌‍﻿­]/g, '').replace(/\s+/g, ' ').trim();

/** Site-style slug: lowercase, punctuation dropped, spaces to hyphens. */
function slugify(title: string): string {
  return clean(title)
    .toLowerCase()
    .replace(/[’'"“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Escape text for safe inclusion in the CMS rich-text field. */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Turn a PDF into plain text, one string per page.
 * -layout preserves the visual column structure, which keeps centred headings
 * on their own lines — that is what makes the lesson headings findable.
 */
async function pdfPages(file: string): Promise<string[]> {
  try {
    const { stdout } = await run('pdftotext', ['-layout', file, '-'], { maxBuffer: 64 * 1024 * 1024 });
    return stdout.split('\f');
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'ENOENT') {
      throw new Error('pdftotext not found. Install poppler first:  brew install poppler');
    }
    throw err;
  }
}

/**
 * Find where each lesson starts.
 *
 * A lesson heading is a centred "N. Title" line. Numbers alone are far too
 * common in body text, so a line only counts as a heading when a scripture
 * reference and the story marker follow within the next handful of lines.
 */
function findLessonStarts(lines: string[]): { number: number; title: string; line: number }[] {
  const starts: { number: number; title: string; line: number }[] = [];
  // Lesson numbers only ever increase, but do not insist on exactly +1: one
  // unrecognised heading must not swallow every lesson after it.
  let last = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!;
    const text = clean(raw);
    // The table of contents matches the same shape, but its lines end in a
    // page number after a run of dot leaders. Those leaders are a mix of ASCII
    // periods and U+2026 ellipsis characters, so match both.
    if (/[.…·][\s.…·]*\d{1,3}\s*$/.test(text)) continue;

    const m = text.match(/^(\d{1,2})\.\s*(\S.*)$/);
    if (!m) continue;
    const number = Number(m[1]);
    if (number <= last) continue;
    const title = clean(m[2]!);
    if (!title || title.length > 90) continue;

    // Corroborate by INDENTATION: lesson headings are centred, so they always
    // carry some leading whitespace, while narrative starts at the margin. The
    // threshold is deliberately low because a long title centres to only a few
    // spaces — the table of contents is already excluded by its dot leaders.
    // This is the only signal every lesson has: some have no scripture
    // reference, and some no "THE STORY:" divider.
    const indent = raw.length - raw.replace(/^[\s​]+/, '').length;
    if (indent < 2) continue;

    starts.push({ number, title, line: i });
    last = number;
  }
  return starts;
}

/**
 * Merge wrapped lines into paragraphs, dropping page furniture.
 *
 * `indentBreaks` suits the narrative, where a new paragraph is signalled by
 * indenting its FIRST line while continuations sit at the left margin. It must
 * stay off for the header and the memory verse, whose wrapped lines are
 * indented to hang under a bullet — there, an indent means the opposite.
 */
function toParagraphs(lines: string[], breakBefore?: RegExp, indentBreaks = false): string[] {
  const paras: string[] = [];
  let buf: string[] = [];
  const flush = () => {
    const t = clean(buf.join(' '));
    // Bare page numbers and stray artefacts are not paragraphs.
    if (t && !/^\d{1,3}$/.test(t) && t.length > 2) paras.push(t);
    buf = [];
  };
  for (const raw of lines) {
    const line = raw.replace(/[​‌‍﻿]/g, '');
    if (!line.trim()) { flush(); continue; }
    // A footer page number on its own line ends the paragraph above it.
    if (/^\s*\d{1,3}\s*$/.test(line)) { flush(); continue; }
    // Some header lines follow one another with no blank line between them.
    if (breakBefore?.test(line)) flush();
    // The curriculum separates story paragraphs by indenting the FIRST line
    // rather than by a blank line: continuation lines sit at the left margin,
    // so an indented line always begins a new paragraph.
    else if (indentBreaks && /^\s{3,}\S/.test(line) && buf.length) flush();
    buf.push(line.trim());
  }
  flush();
  return paras;
}

/** Parse one lesson's slice of text into a draft. */
function parseLesson(
  lines: string[],
  start: { number: number; title: string; line: number },
  lang: string,
  collection: string,
  sourcePdf: string,
): { draft?: Draft; problem?: Problem } {
  const marks = MARKERS[lang]!;
  const fail = (reason: string) => ({ problem: { number: start.number, title: start.title, reason } });

  // The publishable part runs from the heading to the memory verse or the
  // first facilitator section, whichever comes first.
  let end = lines.length;
  let memoryAt = -1;
  for (let i = start.line + 1; i < lines.length; i++) {
    if (marks.memory.test(lines[i]!)) { memoryAt = i; end = i; break; }
    if (marks.stop.test(lines[i]!)) { end = i; break; }
  }

  // Key theme, core concepts and context are all published as body text on the
  // live pages, so the story marker is only a divider to be removed — not a
  // boundary the parse depends on. Two lessons have no marker at all.
  const storyAt = lines.findIndex((l, i) => i > start.line && i < end && marks.story.test(l));
  // The header (scripture reference, key theme, core concepts) runs from the
  // title to the first blank line; the narrative follows. Lessons with no
  // "THE STORY:" divider split at exactly the same place.
  const spanAll = lines.slice(start.line + 1, end);
  let headerEnd = spanAll.findIndex((l) => !l.trim());
  if (headerEnd < 0) headerEnd = 0;

  // Header lines are each centred and self-contained, so up to the first
  // "Key Theme"/"[Core Gospel Concepts" marker keep them as separate lines: a
  // title can wrap onto a second line and a lesson can cite two passages.
  // After that marker they may wrap, so join them normally.
  const headerLines = spanAll.slice(0, headerEnd).filter((l) => l.trim());
  let k = headerLines.findIndex((l) => marks.breakBefore.test(l));
  if (k < 0) k = headerLines.length;
  const preLines = headerLines.slice(0, k).map(clean).filter(Boolean);
  const header = toParagraphs(headerLines.slice(k), marks.breakBefore);
  const narrative = toParagraphs(
    spanAll.slice(headerEnd).filter((l) => !marks.story.test(l)),
    marks.breakBefore,
    true,
  );
  const head = [...header, ...narrative];
  void headerLines;
  if (head.length === 0) return fail('no content between the heading and the next section');

  // A wrapped title continues on the next centred line and carries no chapter
  // or verse number; the scripture reference always does. Split on that.
  const titleExtra = preLines.filter((l) => !/\d/.test(l));
  const scriptureRef = preLines.filter((l) => /\d/.test(l)).join('; ');
  const body = head;
  if (body.length === 0) return fail('lesson has a reference but no body text');

  // Memory verse, when present, runs to the next facilitator section.
  let memory: string[] = [];
  if (memoryAt >= 0) {
    let mEnd = lines.length;
    for (let i = memoryAt + 1; i < lines.length; i++) {
      if (marks.stop.test(lines[i]!)) { mEnd = i; break; }
    }
    const joined = toParagraphs(lines.slice(memoryAt + 1, mEnd))
      .map((t) => t.replace(/^[●○•\-\s]+/, ''))
      .filter(Boolean)
      .join(' ');
    memory = joined ? [joined] : [];
  }

  const paragraphs = [...body, ...memory.map((m) => `Optional Memory Verse: ${m}`)];

  // Everything after the publishable part, kept for the client to decide on.
  const notesStart = memoryAt >= 0 ? memoryAt : end;
  const facilitatorNotes = toParagraphs(lines.slice(notesStart, Math.min(notesStart + 400, lines.length)));

  return {
    draft: {
      number: start.number,
      lang,
      collection,
      title: [start.title, ...titleExtra].join(' ').trim(),
      alias: slugify([start.title, ...titleExtra].join(' ')),
      scriptureRef,
      paragraphs,
      bodyHtml: paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n'),
      facilitatorNotes,
      hadStoryMarker: storyAt >= 0,
      sourcePdf: path.basename(sourcePdf),
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const arg = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
  const lang = arg('lang') ?? 'en';
  const collection = arg('collection') ?? 'sonship';
  const outDir = path.resolve(arg('out') ?? path.join(import.meta.dirname, '../../drafts'));
  const checkOnly = args.includes('--check');

  if (!file) throw new Error('Usage: node src/extract-pdf.ts <file.pdf> --lang=en --collection=sonship');
  if (!MARKERS[lang]) throw new Error(`No section markers defined for language "${lang}" (have: ${Object.keys(MARKERS).join(', ')})`);

  const lines = (await pdfPages(file)).join('\n').split('\n');
  const starts = findLessonStarts(lines);
  if (starts.length === 0) throw new Error('No lessons found — the document structure has changed.');

  const drafts: Draft[] = [];
  const problems: Problem[] = [];
  for (const s of starts) {
    const { draft, problem } = parseLesson(lines, s, lang, collection, file);
    if (draft) drafts.push(draft);
    if (problem) problems.push(problem);
  }

  console.log(`${path.basename(file)}  [${collection}/${lang}]`);
  console.log(`  lessons found:    ${starts.length}`);
  console.log(`  parsed cleanly:   ${drafts.length}`);
  console.log(`  need attention:   ${problems.length}`);
  const noMemory = drafts.filter((d) => !d.paragraphs.some((p) => p.startsWith('Optional Memory Verse')));
  if (noMemory.length) console.log(`  without a memory verse: ${noMemory.map((d) => d.number).join(', ')}`);
  const noRef = drafts.filter((d) => !d.scriptureRef);
  if (noRef.length) console.log(`  no scripture reference (add by hand): ${noRef.map((d) => d.number).join(', ')}`);
  const noMarker = drafts.filter((d) => !d.hadStoryMarker);
  if (noMarker.length) console.log(`  no story divider (check the split): ${noMarker.map((d) => d.number).join(', ')}`);
  // Numbering is consecutive, so a gap means a heading was missed entirely.
  const gaps = drafts.length ? [...Array(Math.max(...drafts.map((d) => d.number))).keys()]
    .map((n) => n + 1).filter((n) => !drafts.some((d) => d.number === n)) : [];
  if (gaps.length) console.log(`  MISSING lesson numbers: ${gaps.join(', ')}`);
  for (const p of problems) console.log(`    ! ${p.number}. ${p.title} — ${p.reason}`);

  if (checkOnly) return;

  const dir = path.join(outDir, `${collection}-${lang}`);
  // Wipe first: drafts are named after the title, so a corrected title would
  // otherwise leave the previous run's file behind and double-count the story.
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  for (const d of drafts) {
    await fs.writeFile(
      path.join(dir, `${String(d.number).padStart(2, '0')}-${d.alias}.json`),
      JSON.stringify(d, null, 2),
    );
  }
  console.log(`\nWrote ${drafts.length} drafts to ${dir}`);
}

main().catch((err) => {
  console.error(String(err instanceof Error ? err.message : err));
  process.exit(1);
});
