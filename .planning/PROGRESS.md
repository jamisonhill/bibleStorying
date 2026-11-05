# Progress — Bible Storying Kenya app

## Phase 1 — Research & architecture decisions [COMPLETE]
## Phase 2 — Content pipeline (crawler → versioned bundle) [COMPLETE]
## Phase 3 — Expo app (offline stories, audio, downloads, OTA content) [COMPLETE]
## Phase 4 — Hosting & auto-update live on GitHub Pages [COMPLETE]
## Phase 5 — Simulator + physical-device verification [COMPLETE]
## Phase 7 — Website content completion via the CMS [COMPLETE — 2 content gaps below]
## Phase 8 — Videos tab + bottom tab navigation [COMPLETE — 1 asset gap below]
## Phase 10 — Ben's feedback round + app polish [COMPLETE — item 2 parked]

## Phase 6 — Beta testing [IN PROGRESS — awaiting feedback]
- [x] Release builds on two tester iPhones (Duski's 17; Ben's 16 Pro Max,
      udid 00008140-00166D460C38801C, 2026-09-02)
- [x] Simulator pass 2026-09-18: mini-player docking, video download + playback,
      audio download, dark mode, booklets, About links, Contact Us — all verified
- [ ] Collect tester feedback; verify offline, lock-screen audio, language switch
- [x] Android 15 emulator pass 2026-09-25 (found + fixed lock-screen bug, 9c12b98)
- [x] Testers on the pre-2026-09-18 build: new build available via TestFlight (Phase 9B)

## Waiting on Ben / the client
- [x] Contact Us (resource 6) published — live with iframe (checked 2026-09-25)
- [x] Contact form: address changed by the client and confirmed working (2026-10-14)
- [x] Item 2 — story numbering: decided app cards (2026-10-14); built on branch post-review
- [ ] (Waiting, client side) A master for the 360p "Chronological Bible Storying 2025" film
      (RUNBOOK §7 has the transcode recipe)
- [ ] Story 25 has no scripture reference; story 31 has no cloth art (Jamison telling Ben)
- [ ] Extractor (extract-pdf.ts, draft tool only) needs a CBS Swahili marker set — low priority

## Phase 9 — 1.0.0 store launch [COMPLETE — iOS unlisted + Android live; Ben has both links]
- [ ] EU trader status (currently non-trader)

## Phase 11 — 1.0.1 release [IN PROGRESS]
- [x] Merged `post-review` (story numbers, mini-player hide, Android artwork, lint clean)
- [x] Ben's request: story image pinned at top while scrolling
- [x] Wire in-app feedback (More → Send Feedback → feedback.obedworks.com)
- [x] Version 1.0.1; iOS build 4 + Android vc 4 built and submitted (2026-11-05)
- [ ] Device check of preview APK: lock-screen artwork, mini-player hide, pinned image, feedback
- [ ] Apple + Google approval ← PAUSED HERE
- [ ] Confirm both stores show 1.0.1, tell Ben

## Optional polish (not blocking)
- [ ] RUNBOOK §13 references a React.xcframework recovery that is not in the file
