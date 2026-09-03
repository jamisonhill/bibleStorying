# Resume — Bible Storying Kenya app

**Paused:** 2026-09-03 · **Reason:** Videos tab + bottom tabs shipped and published; iOS build handed to another session
**Phase/Task:** Phase 8 — Videos; everything landed except device verification
**Tree:** clean · **Last commit:** ed2ee14 docs: when a hand-built content bundle actually reaches Pages

## State
- **Videos tab is live end to end.** 4 films (540p H.264/AAC, faststart, ~142MB)
  hosted as GitHub release `videos-v1`, downloaded on demand like story audio.
  Verified anonymously: HTTP 200, exact bytes, round-trip SHA-256 match.
- **Manifest v4 is published** at `jamisonhill.github.io/bibleStorying/manifest.json`
  — 266 stories, 4 videos, all URLs resolving. Confirmed against the live URL.
- **Navigation changed shape:** flat Stack → bottom tabs (Stories · Videos · More);
  About + Settings moved into More. README updated, since the old 3-level
  hierarchy was a documented design decision.
- **Sonship 13-31 went live** while this ran — Ben published them. 228 → 266 stories.
- **Nothing has run on hardware.** `expo-video` is new native code, so it needs a
  real build, not Expo Go. Pipeline 21/21 and both typechecks pass.

## Next action
1. **In the iOS session:** `cd app && npx expo run:ios` (native rebuild required —
   expo-video was added). Then verify, in order:
   - three tabs render and switch
   - start a story, switch tabs → **mini-player sits above the tab bar, not over it**
     (the one piece of layout math done blind — `components/mini-player.tsx:29`,
     offset by `TAB_BAR_HEIGHT` from `constants/layout.ts`)
   - Videos tab shows 4 posters; a download reports progress and survives relaunch
   - downloaded video plays in airplane mode
2. Ask Ben for the "Chronological Bible Storying 2025" master from YouTube Studio —
   the only 360p asset. RUNBOOK §7 has the transcode + `gh release upload`.

## Gotchas
- **Video URLs are cheap to change; the Pages base URL is not.** Video URLs live in
  `manifest.json` and republish every build; `DEFAULT_CONTENT_BASE_URL` does not (§2).
- Don't delete or retag release `videos-v1`; phones point straight at those assets.
- Hand-committing `content/` does not deploy it — the 03:15 UTC run does, or
  `gh workflow run "Update content bundle"` to publish now. RUNBOOK §13.
- `app/src/lib/db.ts` has **no migration path** (all `CREATE TABLE IF NOT EXISTS`).
  New content types need new tables, never new columns on `stories`.
- Homebrew is dead on this Intel Mac; `ffmpeg`/`ffprobe` need a static build.
