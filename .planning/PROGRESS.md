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
- [ ] Testers on the pre-2026-09-18 build need a new build — now via TestFlight (Phase 9B)

## Waiting on Ben / the client
- [x] Contact Us (resource 6) published — live with iframe (checked 2026-09-25)
- [ ] Confirm the live test message reached hello@biblestoryingkenya.com
- [ ] Item 2 — story numbering on the preview pictures (app cards, website
      grid, or burned into the artwork: undecided)
- [ ] A master for the 360p "Chronological Bible Storying 2025" film
      (RUNBOOK §7 has the transcode recipe)
- [ ] Story 25 has no scripture reference; story 31 has no cloth art
- [ ] Extractor needs a CBS Swahili marker set ("UTANGULIZI:" collides with Sonship)

## Phase 9 — Publishing under Obed Works [PLANNED 2026-09-25]
Apple TestFlight first (Ben tests), Android prepared in parallel, then a joint
final release. Ben closes his accounts (PDFs sent 2026-09-25).

A. Prereqs
- [x] Obed Works LLC team HFAWAP3F3Z; bundle ID registered; privacy policy + More-tab link;
      encryption flag; EAS project @jamisonhill/bible-storying-kenya
- [ ] Accept current agreements in App Store Connect; EU trader status (currently non-trader)
- [ ] Decide iPad support before the first public release (can't drop it later)
B. iOS → TestFlight
- [x] ASC app 6816198255; build 1.0.0 (2) uploaded; group "Kenya Testers" in Beta App Review
- [ ] Send Ben https://testflight.apple.com/join/bc63E4Nq once review passes
- [ ] Next iOS build picks up the player.ts fix (iOS was not affected)
C. Store listings — [x] both complete, not submitted (store/listing.md has every answer)
- [ ] Public vs unlisted final release decision
D. Android
- [x] Play org account 7371887258743915726 verified; app 4974984723936912897 created;
      all App content declarations done; listing saved; internal track live with vc 2
- [x] Upload service account eas-play-upload (key /Users/jamisonhill/.google-play/,
      5 app permissions granted 2026-09-25) — RUNBOOK §7
- [ ] versionCode 3 (EAS build 7e9878f9, has the fix) → internal via eas submit ← PAUSED HERE
      (first attempt 2026-09-25 22:40: "missing permissions" — likely propagation delay)
- [ ] Internal testing + pre-launch report
E. Release
- [ ] Apple App Review (or unlisted request) + Play production, same week

## Optional polish (not blocking)
- [ ] Hide the mini-player on the story screen that is already playing (it
      covers the "Download for offline" row until you scroll)
- [ ] Pre-existing lint errors: `splash-overlay.tsx` refs-during-render,
      `use-color-scheme.web.ts` setState-in-effect
- [ ] Android media notification has no artwork (bundled images are resource names, not URLs)
- [ ] RUNBOOK §13 references a React.xcframework recovery that is not in the file
