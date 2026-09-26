# Resume — Bible Storying Kenya app

**Paused:** 2026-09-25 · **Reason:** Store setup done in both consoles; waiting on Play upload-permission propagation and Apple beta review
**Phase/Task:** Phase 9D — upload Android versionCode 3 to Play internal testing
**Tree:** clean · **Last commit:** see `git log -1` (pause commit)

## State
- Publishing moved to Obed Works LLC (Apple team HFAWAP3F3Z, Play account 7371887258743915726). Ben sent exit + authorization-letter PDFs.
- iOS 1.0.0 (2) in TestFlight Beta App Review, group "Kenya Testers", public link ready.
- Both store listings, ratings, privacy and declarations complete but NOT submitted (answers in store/listing.md).
- Android: internal track live with vc 2 (testers servant@obedworks.com, megvlliams@gmail.com). Fixed Android lock-screen bug (9c12b98); EAS build 7e9878f9 = vc 3 with the fix.
- `eas submit -p android` failed "service account missing permissions" though 5 app permissions are granted — likely Google's ~24h propagation.

## Next action
1. Retry: temporarily add `"android": {"serviceAccountKeyPath": "/Users/jamisonhill/.google-play/obed-works-play-publishing.json", "track": "internal"}` to app/eas.json submit.production, run `npx eas-cli submit -p android --profile production --id 7e9878f9-6170-4256-9cbd-c10524eb23e8 --non-interactive`, then `git checkout app/eas.json`.
2. If still refused, check the account's permissions in Play Console (Users and permissions → eas-play-upload); fallback is manual upload in the browser.
3. Check TestFlight review; when approved, tell Jamison to send Ben the link.
4. Then: iPad-support + public/unlisted decisions, new iOS build with the fix, final submissions.

## Gotchas
- Use `/opt/homebrew/bin/brew` (native); `/usr/local/bin/brew` runs under Rosetta. Emulator: `export JAVA_HOME=/opt/homebrew/opt/openjdk@17 ANDROID_HOME=/opt/homebrew/share/android-commandlinetools; $ANDROID_HOME/emulator/emulator -avd bsk_pixel`.
- Store builds are .aab; to install on the emulator convert with `bundletool build-apks --mode=universal` (debug keystore ~/.android/debug.keystore).
- Browser tool uploads max 10 MB; larger files go through the macOS file picker (osascript Cmd-Shift-G + path).
- EAS credential setup and submits refuse `--non-interactive` from env vars — key paths go in eas.json temporarily (never commit them).
- App Store Connect session in Chrome logged out; Jamison signs back in when needed.
