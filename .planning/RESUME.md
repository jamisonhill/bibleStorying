# Resume — Bible Storying Kenya app

**Paused:** 2026-09-03 · **Reason:** Sonship 13-31 staged as CMS drafts; awaiting Ben's publish decision
**Phase/Task:** Phase 7 — website content completion (staging done, nothing published)
**Tree:** clean · **Last commit:** a153ce3 docs: record how the website CMS actually works

## State
- The website publishes Sonship stories 1-12 only. Stories **13-31 now exist as
  UNPUBLISHED drafts** in the CMS: English ids 297-315, Swahili 316-334. They were
  created this session from the 2026 curriculum PDFs in `documents/` — they were
  never live, and no existing page was modified (196-207 untouched, last edited April).
- Verified: all 38 render identically to `drafts/`, are absent from `sitemap.xml`,
  and 404 publicly. Cloth art set for lessons 13-30 in both languages.
- Extractor validated against the 12 live pages: lowest similarity 0.991, eight at 1.000.
- Two new pipeline commands: `npm run report` (coverage + crossKey audit) and
  `npm run extract` (PDF → drafts). `drafts/` and `documents/` are gitignored.
- Audio remains the biggest content gap: Maasai 0/45, Sonship 0/24, Acts 0/22.

## Next action
1. Get Ben's decision on publishing Sonship 13-31 — it would be their **first**
   public appearance, not a re-publish. Do not publish without it.
2. If yes: tick Published in the CMS, English first. The check that matters is
   the **index grid** — `sonship-stories/english-stories2.html` must show 13+
   cards — because the crawler discovers stories from the nav → index pages,
   not from `sitemap.xml` (`build.ts` step 3). Confirm the next daily crawl
   commits them before doing Swahili.
   Delivery is automatic from there: crawl 03:15 UTC → GitHub Pages → the app's
   once-a-day launch check. Roughly 24-48h to reach a phone. New installs still
   need `npm run seed` + a build to carry the stories offline out of the box.
3. Get the actual error text for Jamison's local `npm run build` (Node 25.6.1 and
   sharp both load fine, so it is not the install).

## Gotchas
- CMS specifics — template ids, the draft workflow, the "Double action (GET & POST)"
  silent no-op, stale editor iframes — are documented in **RUNBOOK.md §6**. Read it
  before touching the CMS again.
- `content/` is generated; the build now only garbage-collects its own hashed
  `.webp` files, so stray files there survive (`build.ts`, `isMirroredImage`).
- Physical-device testing needs a native build — Expo Go is stuck at SDK 54.
- A locked iPhone reports `developerModeStatus: disabled`; unlock before debugging.
