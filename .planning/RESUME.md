# Resume — Bible Storying Kenya app

**Paused:** 2026-10-26 · **Reason:** Android live; iOS back In Review, waiting on Apple
**Phase/Task:** Phase 9 — first store release (iOS unlisted, Android public)
**Tree:** clean · **Last commit:** see `git log -1`

## State
- iOS 1.0.0 (3) rejected 2026-10-12 under 4.3 Spam + 4.2.6 (client app under Obed Works). Replied 2026-10-14 in ASC (no resubmit, per Apple) with the 9 answers + signed authorization letter. Draft text was in the scratchpad only; the sent copy is in ASC Messages.
- Apple replied 2026-10-19: "We will continue the review." Still In Review on 2026-10-26.
- Unlisted distribution approved 2026-10-20 (case 102992599634). Only App Review remains.
- Ben has the Play link; a real user confirmed the Android install.
- Android 1.0.0 (vc 3) is LIVE: https://play.google.com/store/apps/details?id=com.biblestoryingkenya.app
- Branch `post-review` (1a9afc2, pushed) holds 1.0.1: story numbers on cards, mini-player hidden on its own story, Android lock-screen artwork, lint fixes. Do not merge before both approvals.
- Ben has TestFlight; Jamison is telling him about story 25 (no scripture ref) and 31 (no cloth art).

## Next action
1. Check Apple: ASC → Bible Storying Kenya → App Review → submission e6f19ac9 → Messages (API doesn't expose messages). (Android already live.)
2. Apple accepts → back in review. Holds firm on 4.2.6 → App Review Board appeal, or Ben's own org account.
3. iOS approved → Jamison presses Release; send Ben the unlisted link (ASC → Pricing and Availability); then merge `post-review`, verify on a device, ship 1.0.1.

## Gotchas
- ASC reply box caps at 4000 chars (newlines count double).
- Don't upload new iOS builds while 1.0.0 is under review.
- EAS submits need key paths added to app/eas.json temporarily, then `git checkout app/eas.json`. Android key: /Users/jamisonhill/.google-play/obed-works-play-publishing.json. iOS: ASC key MJ2A5MH3KV, issuer ff442907-b72c-4ffa-a2d6-e526a6569aa1.
- Nightly content commits land on main daily; `git pull --rebase` before pushing.
