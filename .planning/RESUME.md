# Resume — Bible Storying Kenya app

**Paused:** 2026-11-05 · **Reason:** 1.0.1 submitted to both stores; waiting on review
**Phase/Task:** Phase 9 — store releases (iOS unlisted, Android public)
**Tree:** clean · **Last commit:** see `git log -1`

## State
- 1.0.1 = pinned story image (Ben's request), story numbers on cards, mini-player hidden on its own story, Android lock-screen artwork, Send Feedback (More tab → feedback.obedworks.com → REPORTS.md).
- iOS 1.0.1 (build 4): Waiting for Review (review submission 46f17101), release type After Approval.
- Android 1.0.1 (vc 4): production track, status completed with release notes; in Google review.
- `post-review` is merged into main. Test report fb-af22b4db was sent; mark it Done in the feedback Inbox if not already.

## Next action
1. Watch for Apple + Google approval; confirm both stores show 1.0.1, then tell Ben.
2. Android preview APK (pre-bump) was handed off for device checks: lock-screen artwork, mini-player hide, pinned image, Send Feedback. Ask the user how it went.

## Gotchas
- Release-notes text is Play/ASC-only; App Store version + What's New were set via the ASC API (JWT from the .p8 key).
- Play API: a track PUT may hold only one `completed` release — send just the new release.
- EAS submits need key paths added to app/eas.json temporarily, then `git checkout app/eas.json`. Android key: /Users/jamisonhill/.google-play/obed-works-play-publishing.json. iOS: ASC key MJ2A5MH3KV, issuer ff442907-b72c-4ffa-a2d6-e526a6569aa1.
- Local iOS sim builds: `app/ios/` is generated; if the build breaks, `npx expo prebuild -p ios --clean` and set `ios/.xcode.env.local` NODE_BINARY=/opt/homebrew/bin/node. The simulator runs headless (no Simulator.app), so taps aren't possible.
- Nightly content commits land on main daily; `git pull --rebase` before pushing.
