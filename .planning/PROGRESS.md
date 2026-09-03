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
- [x] **Stale booklet PDFs replaced and live** (Ben's items 1 & 3): Sonship EN
      70pp→221pp, Sonship SW 73pp→234pp, CBS SW Apr-2025→2026 revision
- [ ] Story 25 has no scripture reference; story 31 has no cloth art
- [ ] Extractor needs a CBS Swahili marker set ("UTANGULIZI:" collides with Sonship)
- [ ] Diagnose Jamison's local `npm run build` failure (env checks out; need the error)

## Phase 8 — Videos tab + bottom tab navigation [MOSTLY COMPLETE]
- [x] 4 films transcoded 540p H.264/AAC + faststart + poster frames (~142MB)
- [x] `pipeline/videos.json` + `videos.ts` loader + 6 tests (videos are declared,
      not crawled — they were never on the website)
- [x] Manifest gains `videos`; posters mirrored into `content/images`
- [x] App: `videos`/`video_downloads` tables, OTA apply, download-on-demand
- [x] Bottom tabs (Stories · Videos · More); About + Settings moved into More
- [x] Hosted as GitHub release `videos-v1`; manifest v4 published and verified live
- [x] iOS build fixed and running on the simulator: tabs render, splash and
      icons verified. RUNBOOK §13 has the React.xcframework recovery
- [ ] **Still unverified even on the simulator:** mini-player docking above the
      tab bar, and video playback/download
- [ ] Replace the 360p "Chronological Bible Storying 2025" with Ben's
      YouTube Studio master (RUNBOOK §7 has the transcode recipe)

## Phase 10 — Ben's feedback round + app polish ← PAUSED HERE
- [x] Static pages now apply over the air (About was seed-only)
- [x] Branded launch stage; 2s launch icon → 5s wordmark
- [x] App + launch icons cut from the ministry's own mark; iOS label "CBS Kenya"
- [x] Back button said "(tabs)"; now names its tab
- [ ] **Contact Us page as an Obed Forms web form** — no email address posted
      on the page (next task)
- [ ] Full-booklet download in the app: pipeline captures the index-page
      `full_story_pdf`; app shows it on the collection screen (approved, not built)
- [ ] About page "View More" links are dropped by `parseStaticPage` — text
      dangles with nothing to tap
- [ ] Dark mode option in Settings (app follows the system only)
- [ ] **Ben's item 2 — story numbering on the preview pictures.** Parked: app
      cards, website grid, or burned into the artwork is undecided

## Phase 9 — Publishing (BLOCKED: client will open dev accounts)
- [ ] Client opens Apple Developer + Google Play accounts
- [ ] Replace placeholder bundle IDs + appleTeamId in app/app.json
- [ ] Decide final content hosting home (repo may move to client org — video URLs
      live in manifest.json and are cheap to change; the Pages base URL is not)
- [ ] EAS build + submit, store listings, privacy labels (checklist in README.md)
