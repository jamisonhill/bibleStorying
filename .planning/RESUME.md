# Resume — Bible Storying Kenya app

**Paused:** 2026-11-05 · **Reason:** 1.0.1 submitted to both stores; waiting on review
**Phase/Task:** Phase 11 — 1.0.1 release, waiting on Apple + Google approval
**Tree:** clean · **Last commit:** 6d4f638 planning: 1.0.1 submitted to both stores

## State
- 1.0.1 contents: pinned story image (Ben's request), story numbers on cards, mini-player hidden on its own story, Android lock-screen artwork, Send Feedback (More tab → feedback.obedworks.com → REPORTS.md).
- iOS 1.0.1 (build 4): Waiting for Review (review submission 46f17101), release type After Approval, still unlisted. Existing users get it through normal App Store updates.
- Android 1.0.1 (vc 4): production track, status completed with release notes, in Google review.
- The 1.0.0 preview APK went to the user for device checks; results not reported yet.
- Feedback test report fb-af22b4db was sent; mark it Done in the Inbox if it's still open.

## Next action
1. Check review status: ASC (`/v1/apps/6816198255/appStoreVersions`) and Play Console. Once both show 1.0.1, tell Ben.
2. Ask the user how the APK device checks went (lock-screen artwork, mini-player hide, pinned image, Send Feedback).

## Gotchas
- iOS What's New also mentions the Android lock-screen artwork. Harmless; change it only if asked.
- Play API: a track PUT may hold only one `completed` release, so send just the new release.
- EAS submits need key paths added to app/eas.json temporarily, then `git checkout app/eas.json`. Android key: /Users/jamisonhill/.google-play/obed-works-play-publishing.json. iOS: ASC key MJ2A5MH3KV, issuer ff442907-b72c-4ffa-a2d6-e526a6569aa1.
- Local iOS sim builds: `app/ios/` is generated; if the build breaks, run `npx expo prebuild -p ios --clean` and set `ios/.xcode.env.local` NODE_BINARY=/opt/homebrew/bin/node. The simulator runs headless (no Simulator.app), so taps aren't possible.
- Nightly content commits land on main daily; `git pull --rebase` before pushing.
