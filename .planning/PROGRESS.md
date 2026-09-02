# Progress — Bible Storying Kenya app

## Phase 1 — Research & architecture decisions [COMPLETE]
## Phase 2 — Content pipeline (crawler → versioned bundle) [COMPLETE]
## Phase 3 — Expo app (offline stories, audio, downloads, OTA content) [COMPLETE]
## Phase 4 — Hosting & auto-update live on GitHub Pages [COMPLETE]
## Phase 5 — Simulator + physical-device verification [COMPLETE]

## Phase 6 — Beta testing ← PAUSED HERE
- [x] Release build installed on tester iPhone (Duski's iPhone 17, direct xcodebuild)
- [x] Release build installed on 2nd tester iPhone (Ben's iPhone 16 Pro Max,
      iOS 26.6.1, udid 00008140-00166D460C38801C) — 2026-09-02
- [ ] Collect beta feedback from Jamison / testers
- [ ] Verify on the tester's phone: airplane-mode offline, lock-screen audio,
      background playback, audio download + delete, language switching
- [ ] Test on a low-end Android device (none available yet this session)
- [ ] Apply feedback fixes

## Phase 7 — Publishing (BLOCKED: client will open dev accounts)
- [ ] Client opens Apple Developer + Google Play accounts
- [ ] Replace placeholder bundle IDs + appleTeamId in app/app.json
- [ ] Decide final content hosting home (repo may move to client org)
- [ ] EAS build + submit, store listings, privacy labels (checklist in README.md)
