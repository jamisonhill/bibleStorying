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
- [x] Contact Us (resource 6) published — live with iframe (checked 2026-09-25)
- [ ] Confirm the live test message reached hello@biblestoryingkenya.com
- [ ] Item 2 — story numbering on the preview pictures (app cards, website
      grid, or burned into the artwork: undecided)
- [ ] A master for the 360p "Chronological Bible Storying 2025" film
      (RUNBOOK §7 has the transcode recipe)
- [ ] Story 25 has no scripture reference; story 31 has no cloth art
- [ ] Extractor needs a CBS Swahili marker set ("UTANGULIZI:" collides with Sonship)

## Phase 9 — Publishing (DECIDED 2026-09-25: publish under Obed Works, not Ben's accounts)
Ben enrolled as an Individual on both stores; Kenya 2FA + time zones made
delegated access impractical. The app ships on Jamison's Obed Works (org) Apple
account and a new Obed Works Google Play account. Ben closes his accounts and
requests refunds (PDF sent: ~/Downloads/Ben - Closing Your Developer Accounts.pdf).
- [ ] Ben: refund + close Apple and Google developer accounts
- [ ] Brand-authorization letter from Ben (Apple may ask for it at review)
- [ ] Open an Obed Works Google Play Console account (org → needs D-U-N-S;
      exempt from the 12-tester/14-day rule)
- [ ] Replace placeholder bundle IDs + appleTeamId (Obed Works) in app/app.json
- [ ] TestFlight first; then App Store with unlisted-distribution request
- [ ] Decide final content hosting home (video URLs live in manifest.json and
      are cheap to change; the Pages base URL is not)
- [ ] EAS build + submit, store listings, privacy labels (checklist in README.md)

## Optional polish (not blocking)
- [ ] Hide the mini-player on the story screen that is already playing (it
      covers the "Download for offline" row until you scroll)
- [ ] Pre-existing lint errors: `splash-overlay.tsx` refs-during-render,
      `use-color-scheme.web.ts` setState-in-effect
- [ ] RUNBOOK §13 references a React.xcframework recovery that is not in the file
