# Progress — Bible Storying Kenya app

## Phase 1 — Research & architecture decisions [COMPLETE]
## Phase 2 — Content pipeline (crawler → versioned bundle) [COMPLETE]
## Phase 3 — Expo app (offline stories, audio, downloads, OTA content) [COMPLETE]
## Phase 4 — Hosting & auto-update live on GitHub Pages [COMPLETE]
## Phase 5 — Simulator + physical-device verification [COMPLETE]
## Phase 7 — Website content completion via the CMS [COMPLETE — 2 content gaps below]
## Phase 8 — Videos tab + bottom tab navigation [COMPLETE — 1 asset gap below]
## Phase 10 — Ben's feedback round + app polish [COMPLETE — item 2 parked]

## Phase 6 — Beta testing [IN PROGRESS — awaiting feedback] ← PAUSED HERE
- [x] Release builds on two tester iPhones (Duski's 17; Ben's 16 Pro Max,
      udid 00008140-00166D460C38801C, 2026-09-02)
- [x] Simulator pass 2026-09-18: mini-player docking, video download + playback,
      audio download, dark mode, booklets, About links, Contact Us — all verified
- [ ] Collect tester feedback; verify offline, lock-screen audio, language switch
- [ ] Test on a low-end Android device (none available yet)
- [ ] Testers on the pre-2026-09-18 build need a new build to get the fixes
      (download-state refresh, theme, booklets, Contact Us)

## Waiting on Ben / the client
- [ ] Tick **Published** on CMS resource Contact Us (6); confirm the live test
      message reached hello@biblestoryingkenya.com
- [ ] Item 2 — story numbering on the preview pictures (app cards, website
      grid, or burned into the artwork: undecided)
- [ ] A master for the 360p "Chronological Bible Storying 2025" film
      (RUNBOOK §7 has the transcode recipe)
- [ ] Story 25 has no scripture reference; story 31 has no cloth art
- [ ] Extractor needs a CBS Swahili marker set ("UTANGULIZI:" collides with Sonship)

## Phase 9 — Publishing (BLOCKED: client will open dev accounts)
- [ ] Client opens Apple Developer + Google Play accounts
- [ ] Replace placeholder bundle IDs + appleTeamId in app/app.json
- [ ] Decide final content hosting home (repo may move to client org — video URLs
      live in manifest.json and are cheap to change; the Pages base URL is not)
- [ ] EAS build + submit, store listings, privacy labels (checklist in README.md)

## Optional polish (not blocking)
- [ ] Hide the mini-player on the story screen that is already playing (it
      covers the "Download for offline" row until you scroll)
- [ ] Pre-existing lint errors: `splash-overlay.tsx` refs-during-render,
      `use-color-scheme.web.ts` setState-in-effect
- [ ] RUNBOOK §13 references a React.xcframework recovery that is not in the file
