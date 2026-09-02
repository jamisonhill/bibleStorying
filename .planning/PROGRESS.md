# Progress — Bible Storying Kenya app

## Phase 1 — Research & architecture decisions [COMPLETE]
## Phase 2 — Content pipeline (crawler → versioned bundle) [COMPLETE]
## Phase 3 — Expo app (offline stories, audio, downloads, OTA content) [COMPLETE]
## Phase 4 — Hosting & auto-update live on GitHub Pages [COMPLETE]
## Phase 5 — Simulator + physical-device verification [COMPLETE]

## Phase 6 — Beta testing [IN PROGRESS — awaiting feedback]
- [x] Release builds on two tester iPhones (Duski's 17; Ben's 16 Pro Max,
      udid 00008140-00166D460C38801C, 2026-09-02)
- [ ] Collect feedback; verify offline, lock-screen audio, downloads, language switch
- [ ] Test on a low-end Android device (none available yet)

## Phase 7 — Website content completion via the CMS ← PAUSED HERE
- [x] `npm run report` — coverage + crossKey audit over the published bundle
- [x] `npm run extract` — Sonship curriculum PDFs → per-lesson drafts (31/31 both langs)
- [x] 38 draft pages staged UNPUBLISHED in Evolution CMS
      (English 297-315, Swahili 316-334 = curriculum lessons 13-31)
- [x] Cloth art assigned to lessons 13-30 in both languages
- [x] Verified: drafts absent from sitemap.xml, 404 publicly, bodies match drafts
- [ ] Ben decides whether Sonship 13-31 are published (see RUNBOOK §14)
- [ ] Story 25 has no scripture reference; story 31 has no cloth art
- [ ] Extractor needs a CBS Swahili marker set ("UTANGULIZI:" collides with Sonship)
- [ ] Diagnose Jamison's local `npm run build` failure (env checks out; need the error)

## Phase 8 — Publishing (BLOCKED: client will open dev accounts)
- [ ] Client opens Apple Developer + Google Play accounts
- [ ] Replace placeholder bundle IDs + appleTeamId in app/app.json
- [ ] Decide final content hosting home (repo may move to client org)
- [ ] EAS build + submit, store listings, privacy labels (checklist in README.md)
