# Resume — Bible Storying Kenya app

**Paused:** 2026-10-31 · **Reason:** iOS approved; waiting on Jamison to press Release
**Phase/Task:** Phase 9 — first store release (iOS unlisted, Android public)
**Tree:** clean · **Last commit:** see `git log -1`

## State
- Android 1.0.0 (vc 3) LIVE on Play; Ben has the link; a real user confirmed install.
- iOS 1.0.0 (3): Pending Developer Release, confirmed in ASC 2026-10-31. Apple approved it.
- Unlisted distribution approved 2026-10-20 (case 102992599634).
- Branch `post-review` (pushed) holds 1.0.1. Do not merge before iOS 1.0.0 is released.

## Next action
1. Jamison presses Release in ASC; send Ben the unlisted link (ASC → Pricing and Availability).
2. Then merge `post-review`, verify Android lock-screen artwork + mini-player hide on a device, ship 1.0.1.

## Gotchas
- While in review: don't upload builds, cancel the submission, or send extra messages.
- ASC review messages aren't in the API — check in the browser (submission e6f19ac9).
- EAS submits need key paths added to app/eas.json temporarily, then `git checkout app/eas.json`. Android key: /Users/jamisonhill/.google-play/obed-works-play-publishing.json. iOS: ASC key MJ2A5MH3KV, issuer ff442907-b72c-4ffa-a2d6-e526a6569aa1.
- Nightly content commits land on main daily; `git pull --rebase` before pushing.
