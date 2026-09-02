# Resume — Bible Storying Kenya app

**Paused:** 2026-08-30 · **Reason:** Jamison is beta testing on-device; will return with feedback
**Phase/Task:** Phase 6 — beta testing (build delivered, awaiting feedback)
**Tree:** clean at pause commit · **Last commit:** see `git log -1` (pause commit)

## State
- Everything works end-to-end and is verified: 228 stories offline, audio
  streaming + per-story/collection downloads, lock-screen playback, in-place
  language switching, Settings/About, dark mode.
- Content auto-update is LIVE: daily GitHub Action crawls the site → publishes
  to https://jamisonhill.github.io/bibleStorying/manifest.json (contentVersion 2).
- Release build signed on Jamison's Apple team (HFAWAP3F3Z) and installed on
  the tester's iPhone 17 via direct xcodebuild (expo run:ios lacked
  -allowProvisioningUpdates / -allowProvisioningDeviceRegistration).

## Next action
1. Read Jamison's beta feedback; fix in app/src/ (screens in app/src/app/,
   services in app/src/lib/).
2. Rebuild to device: cd app/ios && xcodebuild -workspace
   BibleStoryingKenya.xcworkspace -scheme BibleStoryingKenya -configuration
   Release -destination id=<UDID> -derivedDataPath ./build
   -allowProvisioningUpdates -allowProvisioningDeviceRegistration build,
   then xcrun devicectl device install app --device <id> <path.app>.

## Gotchas
- Expo Go on the iOS App Store is stuck at SDK 54 (Apple review backlog); this
  app is SDK 57 — physical-device testing REQUIRES a native build, not Expo Go.
- After `npm run seed` + content changes, bump happens automatically; app DB
  re-imports only when bundled contentVersion > stored one.
- content/ and app/src/content/ + app/assets/content/ are generated — never hand-edit.
- Adding a new tester iPhone: the phone must have Developer Mode ON
  (Settings > Privacy & Security > Developer Mode > restart > confirm), and
  it must be UNLOCKED when you check — a locked phone reports
  `developerModeStatus: disabled` and shows as `unavailable`, which looks
  identical to Developer Mode actually being off. Unlock before debugging it.
- Paid team (HFAWAP3F3Z): dev certs are trusted automatically on registered
  devices, so testers do NOT need the VPN & Device Management trust step.
  Profile is good for a year; 6 devices registered as of 2026-09-02 (100/yr cap).
- Simulator taps via cliclick were flaky (missed Pressables); prefer deep links
  (exp://…/--/story/cbs/en/<slug>) when driving the app in the simulator.
