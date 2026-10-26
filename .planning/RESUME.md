# Resume — Bible Storying Kenya app

**Paused:** 2026-10-26 · **Reason:** Android live; iOS back In Review, waiting on Apple
**Phase/Task:** Phase 9 — first store release (iOS unlisted, Android public)
**Tree:** clean · **Last commit:** see `git log -1`

## State
- Android 1.0.0 (vc 3) LIVE on Play; Ben has the link; a real user confirmed install.
- iOS 1.0.0 (3): Apple accepted our 4.3/4.2.6 answers 2026-10-19 ("will continue the review"). Still In Review 2026-10-26.
- Unlisted distribution approved 2026-10-20 (case 102992599634). Only App Review remains.
- Branch `post-review` (pushed) holds 1.0.1. Do not merge before iOS 1.0.0 is released.

## Next action
1. Wait for Apple's email / status "Pending Developer Release". Nothing to do meanwhile.
2. No decision by ~2026-11-02 → ASC → Contact Us → App Review → ask for review status.
3. Approved → Jamison presses Release; send Ben the unlisted link (ASC → Pricing and Availability).
4. Then merge `post-review`, verify Android lock-screen artwork + mini-player hide on a device, ship 1.0.1.

## Gotchas
- While in review: don't upload builds, cancel the submission, or send extra messages.
- ASC review messages aren't in the API — check in the browser (submission e6f19ac9).
- EAS submits need key paths added to app/eas.json temporarily, then `git checkout app/eas.json`. Android key: /Users/jamisonhill/.google-play/obed-works-play-publishing.json. iOS: ASC key MJ2A5MH3KV, issuer ff442907-b72c-4ffa-a2d6-e526a6569aa1.
- Nightly content commits land on main daily; `git pull --rebase` before pushing.
