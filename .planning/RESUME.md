# Resume — Bible Storying Kenya app

**Paused:** 2026-10-10 · **Reason:** BLOCKED on Apple — Obed Works LLC agreements are Pending (New Legal Entity), which 403s the entire App Store Connect API
**Phase/Task:** Phase 9D — Android internal testing DONE; iOS build 3 built but cannot be uploaded
**Tree:** clean · **Last commit:** see `git log -1` (pause commit)

## State
- Publishing moved to Obed Works LLC (Apple team HFAWAP3F3Z, Play account 7371887258743915726). Ben sent exit + authorization-letter PDFs.
- iOS 1.0.0 (2) **passed** Beta App Review — status Testing, expires ~26 Dec 2026. Public link: https://testflight.apple.com/join/bc63E4Nq (only tester so far is jamison.hill@me.com).
- iOS 1.0.0 (3) IS BUILT (EAS bc321ee2-7b03-4f31-8722-5dbcd206548d, from 4a7e092, carries the audio fix) but **every upload path is blocked** — see below.
- ⚠️ **Apple account blocker:** App Store Connect → Business → Obed Works LLC shows Paid Apps + Free Apps agreements both "Pending (New Legal Entity)" and no bank account on file (W-9 is Active, submitted Oct 4). Because of this the ASC API returns 403 REQUIRED_AGREEMENTS_MISSING_OR_EXPIRED on every endpoint, so `eas submit` fails with no log and altool says "Cannot determine the Apple ID from Bundle ID". This will block the final App Store submission too, not just build 3.
- Both store listings, ratings, privacy and declarations complete but NOT submitted (answers in store/listing.md).
- Android: internal track now live with **vc 3** (the lock-screen + first-tap fix, 9c12b98). Testers servant@obedworks.com, megvlliams@gmail.com.
- The submit failure was NOT propagation: the service account lacked "Release apps to testing tracks" (it only had "Release to production"), so `edits:commit` 403'd. Granted 2026-10-09; `eas submit` then succeeded. Written up in RUNBOOK §13.

## Next action
1. **Needs Jamison (blocking, legal/financial — not for Claude):** get the Obed Works LLC agreements out of "Pending (New Legal Entity)". Add a bank account for the entity, and if it stays pending, contact Apple Developer Support about the new-legal-entity verification. Nothing iOS ships until this clears.
2. Once the API answers (`curl` the ASC API or just retry `eas submit -p ios`), upload build 3 — the ipa is already built, no rebuild needed.
3. Decide iPad support and public/unlisted for both stores.
4. Then the final store submissions (listings/ratings/declarations are already complete but unsubmitted; answers in store/listing.md).

Not blocked by any of the above: Ben's testers can start on iOS build 2 today via the public link, and on Android internal vc 3.

## Gotchas
- Use `/opt/homebrew/bin/brew` (native); `/usr/local/bin/brew` runs under Rosetta. Emulator: `export JAVA_HOME=/opt/homebrew/opt/openjdk@17 ANDROID_HOME=/opt/homebrew/share/android-commandlinetools; $ANDROID_HOME/emulator/emulator -avd bsk_pixel`.
- Store builds are .aab; to install on the emulator convert with `bundletool build-apks --mode=universal` (debug keystore ~/.android/debug.keystore).
- Browser tool uploads max 10 MB; larger files go through the macOS file picker (osascript Cmd-Shift-G + path).
- EAS credential setup and submits refuse `--non-interactive` from env vars — key paths go in eas.json temporarily (never commit them).
- App Store Connect session in Chrome logged out; Jamison signs back in when needed.
- To submit Android without EAS: `npx eas-cli build:view <id> --json` gives the .aab URL; the Play API steps are create edit → upload bundle → PUT tracks/internal → commit.
- iOS submits need ASC API key creds in eas.json (`ascApiKeyPath`/`ascApiKeyIssuerId`/`ascApiKeyId`); the working key is MJ2A5MH3KV (Admin) at ~/.appstoreconnect/private_keys/, issuer ff442907-b72c-4ffa-a2d6-e526a6569aa1. Never commit those lines.
