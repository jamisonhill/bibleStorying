# Resume — Bible Storying Kenya app

**Paused:** 2026-10-14 · **Reason:** Apple rejection answered; waiting on Apple's response and Google review
**Phase/Task:** Phase 9 — first store release (iOS unlisted, Android public)
**Tree:** dirty — untracked app/eslint.config.js (stock config auto-created by `expo lint`; commit or ignore) · **Last commit:** see `git log -1`

## State
- iOS 1.0.0 (3) rejected 2026-10-12 under 4.3 Spam + 4.2.6 (client app under Obed Works). Replied 2026-10-14 in ASC (no resubmit, per Apple) with the 9 answers + signed authorization letter. Draft text was in the scratchpad only; the sent copy is in ASC Messages.
- Android 1.0.0 (vc 3) still "Changes in review" as of 2026-10-14; no policy issues. Goes public on approval.
- Branch `post-review` (1a9afc2, pushed) holds 1.0.1: story numbers on cards, mini-player hidden on its own story, Android lock-screen artwork, lint fixes. Do not merge before both approvals.
- Ben has TestFlight; Jamison is telling him about story 25 (no scripture ref) and 31 (no cloth art).

## Next action
1. Check Apple: ASC → Bible Storying Kenya → App Review → submission e6f19ac9 → Messages (API doesn't expose messages). Check Play Console → Publishing overview.
2. Apple accepts → back in review. Holds firm on 4.2.6 → App Review Board appeal, or Ben's own org account.
3. Both approved + unlisted approved → Jamison presses Release; send Ben both store links; then merge `post-review`, verify on a device, ship 1.0.1.

## Gotchas
- ASC reply box caps at 4000 chars (newlines count double).
- Don't upload new iOS builds while 1.0.0 is under review.
- EAS submits need key paths added to app/eas.json temporarily, then `git checkout app/eas.json`. Android key: /Users/jamisonhill/.google-play/obed-works-play-publishing.json. iOS: ASC key MJ2A5MH3KV, issuer ff442907-b72c-4ffa-a2d6-e526a6569aa1.
- Nightly content commits land on main daily; `git pull --rebase` before pushing.
