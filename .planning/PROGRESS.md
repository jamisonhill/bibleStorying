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
- [x] Apple team HFAWAP3F3Z = Obed Works LLC (confirmed 2026-09-25)
- [ ] Accept current agreements in App Store Connect; declare EU trader status
- [x] Bundle ID `com.biblestoryingkenya.app` registered on the Obed Works team
- [x] Privacy policy live (jamisonhill.github.io/bibleStorying/privacy.html) + More-tab link
- [x] app.json: `ITSAppUsesNonExemptEncryption: false`
- [x] `eas init` → @jamisonhill/bible-storying-kenya
- [ ] Decide iPad support before the first public release (can't drop it later)
B. iOS build → TestFlight
- [x] App Store Connect app record: Apple ID 6816198255, SKU biblestoryingkenya-ios
- [x] Expo account + `eas login`
- [x] Build 1.0.0 (2) built on EAS and uploaded (2026-09-25; recipe in RUNBOOK §7)
- [x] Reusing existing Admin ASC key MJ2A5MH3KV (no 2FA)
- [x] TestFlight test info; external group "Kenya Testers", build 2 in Beta App Review
- [ ] Send Ben the public link https://testflight.apple.com/join/bc63E4Nq once review passes
C. Store listing (while Ben tests)
- [ ] Screenshots (6.9" iPhone; 13" iPad if tablet stays), description,
      keywords, category, age rating, "Data Not Collected", content rights
- [ ] Public vs unlisted final release decision
D. Android
- [ ] Obed Works Play Console org account (D-U-N-S, ID + org verification — slow, start now)
- [ ] `eas build -p android` (AAB, Play App Signing); first upload manual to Internal testing
- [ ] App content: privacy URL, data safety, content rating, target audience,
      ads, foreground-service (media playback) declaration if prompted
- [ ] Listing: icon 512², feature graphic 1024×500, phone screenshots
- [ ] Internal testing + pre-launch report (covers the missing Android device)
E. Release
- [ ] Apple App Review (or unlisted request) + Play production, same week

## Optional polish (not blocking)
- [ ] Hide the mini-player on the story screen that is already playing (it
      covers the "Download for offline" row until you scroll)
- [ ] Pre-existing lint errors: `splash-overlay.tsx` refs-during-render,
      `use-color-scheme.web.ts` setState-in-effect
- [ ] RUNBOOK §13 references a React.xcframework recovery that is not in the file
