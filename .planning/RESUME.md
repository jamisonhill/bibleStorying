# Resume — Bible Storying Kenya app

**Paused:** 2026-10-09 · **Reason:** Android vc 3 is live on the internal track; waiting on Apple TestFlight beta review (console session logged out)
**Phase/Task:** Phase 9D — Android internal testing DONE; next is the iOS side
**Tree:** clean · **Last commit:** see `git log -1` (pause commit)

## State
- Publishing moved to Obed Works LLC (Apple team HFAWAP3F3Z, Play account 7371887258743915726). Ben sent exit + authorization-letter PDFs.
- iOS 1.0.0 (2) in TestFlight Beta App Review, group "Kenya Testers", public link ready.
- Both store listings, ratings, privacy and declarations complete but NOT submitted (answers in store/listing.md).
- Android: internal track now live with **vc 3** (the lock-screen + first-tap fix, 9c12b98). Testers servant@obedworks.com, megvlliams@gmail.com.
- The submit failure was NOT propagation: the service account lacked "Release apps to testing tracks" (it only had "Release to production"), so `edits:commit` 403'd. Granted 2026-10-09; `eas submit` then succeeded. Written up in RUNBOOK §13.

## Next action
1. **Needs Jamison:** sign back into App Store Connect in Chrome (the session is logged out — `authResult=FAILED`), then check whether iOS 1.0.0 (2) cleared TestFlight Beta App Review. When approved, send Ben the public link.
2. Decide iPad support and public/unlisted for both stores.
3. Build a new iOS version carrying the same lock-screen/first-tap fix that Android vc 3 has, submit to TestFlight.
4. Then the final store submissions (listings/ratings/declarations are already complete but unsubmitted; answers in store/listing.md).

## Gotchas
- Use `/opt/homebrew/bin/brew` (native); `/usr/local/bin/brew` runs under Rosetta. Emulator: `export JAVA_HOME=/opt/homebrew/opt/openjdk@17 ANDROID_HOME=/opt/homebrew/share/android-commandlinetools; $ANDROID_HOME/emulator/emulator -avd bsk_pixel`.
- Store builds are .aab; to install on the emulator convert with `bundletool build-apks --mode=universal` (debug keystore ~/.android/debug.keystore).
- Browser tool uploads max 10 MB; larger files go through the macOS file picker (osascript Cmd-Shift-G + path).
- EAS credential setup and submits refuse `--non-interactive` from env vars — key paths go in eas.json temporarily (never commit them).
- App Store Connect session in Chrome logged out; Jamison signs back in when needed.
- To submit Android without EAS: `npx eas-cli build:view <id> --json` gives the .aab URL; the Play API steps are create edit → upload bundle → PUT tracks/internal → commit.
