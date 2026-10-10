# Resume — Bible Storying Kenya app

**Paused:** 2026-10-10 · **Reason:** Both stores submitted; waiting on Apple App Review, Apple's unlisted decision, and Google review
**Phase/Task:** Phase 9 — first store release (iOS unlisted, Android public)
**Tree:** clean · **Last commit:** 01c94ca progress: unlisted distribution request filed with Apple

## State
- iOS 1.0.0 (build 3, has the audio fix) is WAITING_FOR_REVIEW since 2026-10-10 19:03 UTC. Release type Manual, so approval does not publish it.
- Unlisted request filed by Jamison 2026-10-10; Apple replies by email to the Account Holder.
- Android 1.0.0 (vc 3) sent to Google review as the first production launch, all countries. Managed publishing off, so it goes public the moment Google approves it.
- TestFlight build 2 still live: https://testflight.apple.com/join/bc63E4Nq (expires ~26 Dec). Ben has not been sent it yet.

## Next action
1. Check iOS: ASC API `/v1/appStoreVersions/4c7fabb3-38d8-4099-ac2d-f98b4451c59f` → appStoreState. Check Android: Play Console → Publishing overview.
2. Rejection or questions → reply in Resolution Center / Play inbox. Unlisted declined → Jamison decides: public release or appeal.
3. When App Review and unlisted are both approved, Jamison presses Release in App Store Connect; then send Ben the unlisted App Store link and the Play link.

## Gotchas
- EAS submits need key paths added to app/eas.json temporarily, then `git checkout app/eas.json` (never commit them). Android key: /Users/jamisonhill/.google-play/obed-works-play-publishing.json. iOS: ASC key MJ2A5MH3KV (Admin), issuer ff442907-b72c-4ffa-a2d6-e526a6569aa1, at ~/.appstoreconnect/private_keys/.
- python.org Python here has no CA bundle: mint JWTs in Python, do HTTP with curl. In zsh write `${VAR}:commit`, never `$VAR:commit`.
- Nightly content commits land on main daily; `git pull --rebase` before pushing.
- RUNBOOK §13 covers the Play permission, Apple agreement, and first-Play-launch traps.
