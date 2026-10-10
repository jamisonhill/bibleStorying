# Resume — Bible Storying Kenya app

**Paused:** 2026-10-10 · **Reason:** Both stores submitted for review; waiting on Apple App Review, the unlisted request, and Google review
**Phase/Task:** Phase 9E — first store release (iOS unlisted, Android public)
**Tree:** clean · **Last commit:** see `git log -1`

## State
- **iOS 1.0.0 (build 3)** submitted to App Review 2026-10-10 19:03 UTC → WAITING_FOR_REVIEW. Release type **Manual**, so approval does NOT publish it. Review Notes start with "intended for Unlisted App Distribution". iPad support kept (permanent).
- **Unlisted request:** Jamison files it at developer.apple.com/support/unlisted-app-distribution as Account Holder (draft text was given in chat 2026-10-10). Apple declines it if the app isn't already in review — it is.
- **Android 1.0.0 (vc 3)** sent to Google review 2026-10-10 as the first production launch, all countries, full rollout. Managed publishing is **off**, so it goes public as soon as Google approves (Google says up to 7 days).
- Obed Works LLC Apple agreements unblocked once the bank account was added (Jamison, 2026-10-10). Play account is an Organization account, so no 12-tester closed-test rule.
- TestFlight build 2 is still live via https://testflight.apple.com/join/bc63E4Nq (expires ~26 Dec 2026); Android internal track is on vc 3.

## Next action
1. Check status: iOS via the ASC API (`/v1/appStoreVersions/4c7fabb3-38d8-4099-ac2d-f98b4451c59f` → appStoreState) and the unlisted request reply (email to the Account Holder); Android via Play Console → Publishing overview.
2. If Apple rejects or asks questions, answer in Resolution Center. If the unlisted request is declined, decide: release publicly, or appeal.
3. When **both** App Review and unlisted are approved, Jamison presses Release in App Store Connect; then grab the unlisted App Store link plus the Play Store link and send both to Ben.
4. After launch: point the app's content base URL / bundle placeholders at their real values if still pending (see CLAUDE.md), and update README/RUNBOOK with the store links.

## Gotchas
- Use `/opt/homebrew/bin/brew` (native); `/usr/local/bin/brew` runs under Rosetta. Emulator: `export JAVA_HOME=/opt/homebrew/opt/openjdk@17 ANDROID_HOME=/opt/homebrew/share/android-commandlinetools; $ANDROID_HOME/emulator/emulator -avd bsk_pixel`.
- EAS submits need key paths in eas.json temporarily (never commit them). Android: `"android": {"serviceAccountKeyPath": "/Users/jamisonhill/.google-play/obed-works-play-publishing.json", "track": "internal"}`. iOS: `ascApiKeyPath` ~/.appstoreconnect/private_keys/AuthKey_MJ2A5MH3KV.p8, `ascApiKeyIssuerId` ff442907-b72c-4ffa-a2d6-e526a6569aa1, `ascApiKeyId` MJ2A5MH3KV (Admin).
- python.org Python here has no CA bundle: urllib over HTTPS fails. Mint JWTs in Python, do HTTP with curl. In zsh use `${VAR}:commit`, never `$VAR:commit`.
- Store builds are .aab; to install on the emulator convert with `bundletool build-apks --mode=universal` (debug keystore ~/.android/debug.keystore).
- Browser tool uploads max 10 MB; larger files go through the macOS file picker (osascript Cmd-Shift-G + path).
- RUNBOOK §13 has the Play-permission, Apple-agreement, and first-Play-launch write-ups.
