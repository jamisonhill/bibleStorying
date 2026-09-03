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

## Phase 7 — Website content completion via the CMS [MOSTLY COMPLETE]
- [x] `npm run report` / `npm run extract`; 38 drafts staged, cloth art assigned
- [x] **Ben published Sonship 13-31** — live in English + Swahili, 12→31 each.
      Bundle went 228 → 266 stories (v3). RUNBOOK §14 item closed.
- [ ] Story 25 has no scripture reference; story 31 has no cloth art
- [ ] Extractor needs a CBS Swahili marker set ("UTANGULIZI:" collides with Sonship)
- [ ] Diagnose Jamison's local `npm run build` failure (env checks out; need the error)

## Phase 8 — Videos tab + bottom tab navigation ← PAUSED HERE
- [x] 4 films transcoded 540p H.264/AAC + faststart + poster frames (~142MB)
- [x] `pipeline/videos.json` + `videos.ts` loader + 6 tests (videos are declared,
      not crawled — they were never on the website)
- [x] Manifest gains `videos`; posters mirrored into `content/images`
- [x] App: `videos`/`video_downloads` tables, OTA apply, download-on-demand
- [x] Bottom tabs (Stories · Videos · More); About + Settings moved into More
- [x] Hosted as GitHub release `videos-v1`; manifest v4 published and verified live
- [ ] **Device verification — the other session's iOS build.** Nothing has run
      on hardware: tab bar, mini-player docking above it, video playback
- [ ] Replace the 360p "Chronological Bible Storying 2025" with Ben's
      YouTube Studio master (RUNBOOK §7 has the transcode recipe)

## Phase 9 — Publishing (BLOCKED: client will open dev accounts)
- [ ] Client opens Apple Developer + Google Play accounts
- [ ] Replace placeholder bundle IDs + appleTeamId in app/app.json
- [ ] Decide final content hosting home (repo may move to client org — video URLs
      live in manifest.json and are cheap to change; the Pages base URL is not)
- [ ] EAS build + submit, store listings, privacy labels (checklist in README.md)
