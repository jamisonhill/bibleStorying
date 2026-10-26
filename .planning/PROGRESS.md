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

## Phase 9 — Publishing under Obed Works [IN PROGRESS — both stores in review]
A. Prereqs
- [x] Team, bundle ID, privacy policy, encryption flag, EAS project
- [x] Apple agreements in effect (bank account added 2026-10-10 cleared "Pending (New Legal Entity)")
- [ ] EU trader status (currently non-trader)
- [x] iPad support kept (2026-10-10)
B. iOS
- [x] TestFlight 1.0.0 (2) passed Beta App Review; public link https://testflight.apple.com/join/bc63E4Nq
- [x] Ben has the TestFlight link; testing soon
- [x] Build 1.0.0 (3) with the player.ts fix, uploaded 2026-10-10
- [x] Submitted 1.0.0 (3) to App Review, manual release, unlisted note in Review Notes
- [x] Unlisted distribution request filed by Jamison 2026-10-10
- [x] Developer Program License Agreement update accepted by Jamison (2026-10-14)
- [x] 2026-10-12 REJECTED 4.3 Spam + 4.2.6 App Generation (client app under our account).
      Replied 2026-10-14 in App Review (did NOT resubmit, per Apple): 9 answers + signed
      authorization letter attached (reply text lives in ASC → App Review → Messages).
- [x] Apple's response 2026-10-19: "We will continue the review" — back In Review
- [ ] App Review decision on 1.0.0 (3) ← WAITING (checked 2026-10-26: still In Review)
- [ ] App Review approved + unlisted approved → Jamison presses Release
D. Android
- [x] Upload service account fixed (needed "Release apps to testing tracks"); vc 3 on internal
- [x] 1.0.0 (vc 3) sent to Google review as first production launch, all countries,
      managed publishing off (goes public on approval)
- [x] Google review approved — live on Play (verified 2026-10-26): https://play.google.com/store/apps/details?id=com.biblestoryingkenya.app
E. Release
- [ ] Send Ben the unlisted App Store link + Play link

## 1.0.1 — branch `post-review` (merge + build only AFTER both stores approve 1.0.0)
- [x] Story numbers on cards, mini-player hidden on its own story, Android artwork, lint 0 errors
- [ ] Verify Android lock-screen artwork + mini-player hide on a device

## Optional polish (not blocking)
- [ ] RUNBOOK §13 references a React.xcframework recovery that is not in the file
