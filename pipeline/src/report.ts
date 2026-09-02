// Content coverage report + crossKey audit.
//
// Reads the PUBLISHED bundle in ../content (no network, no CMS access) and
// answers two questions the daily build can't:
//
//   1. Coverage — which stories are missing translations, audio, artwork or
//      handouts. This is the Kenya team's "what to work on next" list.
//   2. crossKey audit — which stories are linked ACROSS languages incorrectly.
//      build.ts derives crossKey from the storying-cloth number (bsk_28.jpg →
//      "bsk_28") and disambiguates repeats by occurrence order, assuming the
//      site orders those repeats the same way in every language. Where that
//      assumption fails, the app's language switcher sends a reader to an
//      unrelated page. This finds those cases.
//
// Usage:  node src/report.ts [--json] [--strict]
//           --json    machine-readable output instead of the text report
//           --strict  exit 1 if the audit finds any high-confidence problem
//                     (for CI; off by default so coverage gaps don't fail a build)

import fs from 'node:fs/promises';
import path from 'node:path';
import { CONTENT_DIR, LANGUAGES, COLLECTIONS } from './config.ts';
import { StorySchema, ManifestSchema, type Story, type Manifest } from './schema.ts';

const AS_JSON = process.argv.includes('--json');
const STRICT = process.argv.includes('--strict');

/** Language codes in a stable display order, e.g. ['en','sw','ma','br'].
 *  Typed from the schema so a code that isn't a real language fails to compile. */
const LANG_CODES = Object.values(LANGUAGES).map((l) => l.code) as Story['lang'][];
/** Collection ids in a stable display order, e.g. ['cbs','sonship','acts']. */
const COLLECTION_IDS = Object.values(COLLECTIONS).map((c) => c.id) as Story['collection'][];

const langName = (code: string) =>
  Object.values(LANGUAGES).find((l) => l.code === code)?.name ?? code;
const collectionTitle = (id: string) =>
  Object.values(COLLECTIONS).find((c) => c.id === id)?.title ?? id;

/** One flagged crossKey group, with enough detail for a human to judge it. */
type Finding = {
  crossKey: string;
  /** 'mispaired' = evidence they are different stories; the others need eyes. */
  kind: 'mispaired' | 'unverifiable' | 'orphan';
  reason: string;
  members: { lang: string; title: string; scriptureRef: string; sourceUrl: string }[];
};

/**
 * Load every story in the published bundle.
 * Validates through StorySchema so a hand-edited or half-written bundle is
 * caught here rather than producing a silently wrong report.
 */
async function loadBundle(): Promise<{ manifest: Manifest; stories: Story[] }> {
  const manifestRaw = JSON.parse(
    await fs.readFile(path.join(CONTENT_DIR, 'manifest.json'), 'utf8'),
  );
  const manifest = ManifestSchema.parse(manifestRaw);

  const dir = path.join(CONTENT_DIR, 'stories');
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
  const stories = await Promise.all(
    files.map(async (f) =>
      StorySchema.parse(JSON.parse(await fs.readFile(path.join(dir, f), 'utf8'))),
    ),
  );
  return { manifest, stories };
}

/**
 * Extract a language-independent fingerprint of a scripture reference.
 *
 * Book names are translated ("Genesis" / "Mwanzo" / "Uumama"), but the chapter
 * and verse NUMBERS are not — so the digits are the one part of the reference
 * that should match across every translation of the same story. Returns the
 * set of numbers found, e.g. "Matthew 4:1-11, Luke 4:1-13" → {4,1,11,13}.
 *
 * Empty set means the page had no numeric reference at all — common on the
 * song/drama/teaching pages, which is itself a useful signal.
 */
export function scriptureFingerprint(ref: string): Set<string> {
  return new Set(ref.match(/\d+/g) ?? []);
}

/** True when two non-empty fingerprints share no numbers at all. */
export function disjoint(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0 || b.size === 0) return false; // can't tell — not a conflict
  for (const n of a) if (b.has(n)) return false;
  return true;
}

/**
 * Split a group's members into the ones whose scripture agrees with the
 * majority and the ones that disagree with all of them.
 *
 * Naming the odd one out matters: "the Maasai page disagrees with the other
 * three" is a fixable lead, while "br disagrees with ma" (an arbitrary pair
 * from the same group) hides which page is actually wrong.
 *
 * Members with no numeric reference are excluded — silence isn't disagreement.
 */
export function splitByAgreement(members: Story[]): { majority: Story[]; dissenters: Story[] } {
  const withRefs = members.filter((m) => scriptureFingerprint(m.scriptureRef).size > 0);
  if (withRefs.length < 2) return { majority: withRefs, dissenters: [] };

  // Cluster members that share at least one chapter/verse number with each other.
  const clusters: Story[][] = [];
  for (const m of withRefs) {
    const fp = scriptureFingerprint(m.scriptureRef);
    const hit = clusters.find((c) => c.some((o) => !disjoint(fp, scriptureFingerprint(o.scriptureRef))));
    if (hit) hit.push(m);
    else clusters.push([m]);
  }
  if (clusters.length < 2) return { majority: withRefs, dissenters: [] };

  clusters.sort((a, b) => b.length - a.length);
  return { majority: clusters[0]!, dissenters: clusters.slice(1).flat() };
}

/**
 * Audit crossKey groups for translations that were linked to the wrong story.
 *
 * Only groups spanning more than one language can be checked by comparison;
 * single-language groups with a "#N" suffix are reported separately because a
 * suffix means the occurrence-order guess was in play and left a story alone.
 */
function auditCrossKeys(stories: Story[]): Finding[] {
  const findings: Finding[] = [];

  // Group by collection first: crossKeys are only meaningful within one.
  for (const collection of COLLECTION_IDS) {
    const inCollection = stories.filter((s) => s.collection === collection);
    const groups = new Map<string, Story[]>();
    for (const s of inCollection) {
      const list = groups.get(s.crossKey) ?? [];
      list.push(s);
      groups.set(s.crossKey, list);
    }

    for (const [crossKey, members] of groups) {
      // A suffix means build.ts had to break a tie by list position — the
      // assumption most likely to be wrong, so these get the closer look.
      const wasDisambiguated = crossKey.includes('#');
      const detail = members
        .slice()
        .sort((a, b) => a.lang.localeCompare(b.lang))
        .map((m) => ({
          lang: m.lang,
          title: m.title,
          scriptureRef: m.scriptureRef,
          sourceUrl: m.sourceUrl,
        }));

      if (members.length > 1) {
        const { majority, dissenters } = splitByAgreement(members);
        if (dissenters.length > 0) {
          const odd = dissenters.map((d) => langName(d.lang)).join(', ');
          const rest = majority.map((m) => langName(m.lang)).join(', ');
          // Two causes produce this same signal and the fix differs, so say
          // both rather than guessing: either the odd page's reference is
          // wrong, or it carries the wrong storying-cloth number and is a
          // genuinely different story that got linked in by mistake.
          const reason =
            majority.length >= 2
              ? `${odd} disagrees with ${rest} (cites "${dissenters[0]!.scriptureRef}" ` +
                `vs "${majority[0]!.scriptureRef}") — either a wrong reference on that page, ` +
                `or the wrong cloth number, which would make it a different story`
              : `no two pages agree: ${members.map((m) => `${langName(m.lang)} "${m.scriptureRef}"`).join(' vs ')}`;
          findings.push({ crossKey, kind: 'mispaired', reason, members: detail });
          continue;
        }

        // No conflict, but if a disambiguated group mixes a story that cites
        // scripture with one that cites none, the pairing can't be confirmed.
        if (wasDisambiguated) {
          const withRef = members.filter((m) => scriptureFingerprint(m.scriptureRef).size > 0);
          if (withRef.length > 0 && withRef.length < members.length) {
            const bare = members
              .filter((m) => scriptureFingerprint(m.scriptureRef).size === 0)
              .map((m) => m.lang)
              .join(', ');
            findings.push({
              crossKey,
              kind: 'unverifiable',
              reason: `position-matched, but ${bare} cites no chapter/verse so the link cannot be confirmed`,
              members: detail,
            });
          }
        }
      } else if (wasDisambiguated) {
        findings.push({
          crossKey,
          kind: 'orphan',
          reason: `only ${members[0]!.lang} landed on this position-matched key — it links to nothing`,
          members: detail,
        });
      }
    }
  }

  const rank = { mispaired: 0, unverifiable: 1, orphan: 2 };
  return findings.sort((a, b) => rank[a.kind] - rank[b.kind] || a.crossKey.localeCompare(b.crossKey));
}

/** Per collection+language totals, plus the missing-translation breakdown. */
function buildCoverage(stories: Story[]) {
  return COLLECTION_IDS.map((collection) => {
    const inCollection = stories.filter((s) => s.collection === collection);

    const perLang = LANG_CODES.map((lang) => {
      const ss = inCollection.filter((s) => s.lang === lang);
      return {
        lang,
        stories: ss.length,
        audio: ss.filter((s) => s.audio).length,
        image: ss.filter((s) => s.image).length,
        doc: ss.filter((s) => s.doc).length,
      };
    });

    // Languages the site actually publishes here. A language with zero stories
    // is an empty section, not a per-story translation gap, so comparing every
    // story against it would bury the real gaps in noise.
    const activeLangs = perLang.filter((p) => p.stories > 0).map((p) => p.lang);

    const groups = new Map<string, Story[]>();
    for (const s of inCollection) {
      const list = groups.get(s.crossKey) ?? [];
      list.push(s);
      groups.set(s.crossKey, list);
    }

    const missing = [...groups.entries()]
      .map(([crossKey, members]) => {
        const have = new Set(members.map((m) => m.lang));
        const lacks = activeLangs.filter((l) => !have.has(l));
        // Label the group by whichever language is available, English first.
        const label = (members.find((m) => m.lang === 'en') ?? members[0]!).title;
        return { crossKey, title: label, missing: lacks };
      })
      .filter((m) => m.missing.length > 0)
      .sort((a, b) => b.missing.length - a.missing.length || a.crossKey.localeCompare(b.crossKey));

    return { collection, distinctStories: groups.size, activeLangs, perLang, missing };
  });
}

/** Render the human-readable report. */
function printReport(
  manifest: Manifest,
  coverage: ReturnType<typeof buildCoverage>,
  findings: Finding[],
) {
  const out: string[] = [];
  out.push(`Bible Storying Kenya — content report`);
  out.push(`contentVersion ${manifest.contentVersion} · generated ${manifest.generatedAt}`);

  out.push(`\n${'='.repeat(64)}\nCOVERAGE\n${'='.repeat(64)}`);
  for (const c of coverage) {
    out.push(`\n${collectionTitle(c.collection)} — ${c.distinctStories} distinct stories`);
    out.push(`  ${''.padEnd(10)}${LANG_CODES.map((h) => h.padStart(8)).join('')}`);
    for (const row of [
      { name: 'stories', key: 'stories' as const },
      { name: 'audio', key: 'audio' as const },
      { name: 'artwork', key: 'image' as const },
      { name: 'handouts', key: 'doc' as const },
    ]) {
      const cells = LANG_CODES.map((l) => {
        const p = c.perLang.find((x) => x.lang === l)!;
        // Dash for a language this collection doesn't publish at all.
        return (p.stories === 0 ? '—' : String(p[row.key])).padStart(8);
      }).join('');
      out.push(`  ${row.name.padEnd(10)}${cells}`);
    }

    if (c.missing.length === 0) {
      out.push(`  every story is present in all published languages`);
    } else {
      out.push(`  ${c.missing.length} stories missing a translation:`);
      for (const m of c.missing) {
        out.push(`    ${m.crossKey.padEnd(10)} missing ${m.missing.join('/').padEnd(9)} ${m.title}`);
      }
    }
  }

  out.push(`\n${'='.repeat(64)}\nCROSSKEY AUDIT\n${'='.repeat(64)}`);
  if (findings.length === 0) {
    out.push(`\nNo problems found — every cross-language link checks out.`);
  } else {
    const labels = {
      mispaired: 'CONFLICT — one page disagrees with the rest of its language group',
      unverifiable: 'UNVERIFIABLE — needs a human who reads the language',
      orphan: 'ORPHAN — position-matched key with no translations attached',
    };
    for (const kind of ['mispaired', 'unverifiable', 'orphan'] as const) {
      const group = findings.filter((f) => f.kind === kind);
      if (group.length === 0) continue;
      out.push(`\n${labels[kind]}  (${group.length})`);
      for (const f of group) {
        out.push(`\n  ${f.crossKey}`);
        out.push(`    ${f.reason}`);
        for (const m of f.members) {
          out.push(`      ${langName(m.lang).padEnd(8)} ${m.title}`);
          out.push(`      ${''.padEnd(8)} ${m.scriptureRef || '(no scripture reference)'}`);
          out.push(`      ${''.padEnd(8)} ${m.sourceUrl}`);
        }
      }
    }
  }
  console.log(out.join('\n'));
}

async function main() {
  const { manifest, stories } = await loadBundle();
  const coverage = buildCoverage(stories);
  const findings = auditCrossKeys(stories);

  if (AS_JSON) {
    console.log(JSON.stringify({ contentVersion: manifest.contentVersion, coverage, findings }, null, 2));
  } else {
    printReport(manifest, coverage, findings);
  }

  // Only a confirmed mispairing is worth failing CI over: coverage gaps are
  // the client's content backlog, not a defect in the bundle.
  const hard = findings.filter((f) => f.kind === 'mispaired').length;
  if (STRICT && hard > 0) {
    console.error(`\n${hard} mispaired crossKey group(s) — failing because --strict was set.`);
    process.exit(1);
  }
}

// Only run when invoked directly (`node src/report.ts`). Without this guard,
// importing the helpers from a test would print the whole report as a side
// effect of the import.
if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
