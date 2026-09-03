# Resume — Bible Storying Kenya app

**Paused:** 2026-09-04 · **Reason:** Ben's feedback round; next is Contact Us as an Obed Forms web form
**Phase/Task:** Phase 10 — Ben's feedback + app polish
**Tree:** clean · **Last commit:** 0224f5a app: shorten the iOS home screen name to "CBS Kenya"

## State
- **The iOS build works again.** It died in RN's prebuilt-framework swap; recovery
  is in RUNBOOK §13. App runs on the iPhone 17 simulator, Metro attached.
- **Ben's booklet complaints (items 1 & 3) are fixed and live** — Sonship EN/SW and
  CBS SW now serve the 2026 files. They had to be recompressed to clear a 2 MB PHP
  cap, so the live files are not the masters (RUNBOOK §6; the brief for his
  developer: https://claude.ai/code/artifact/1dced9f1-65c1-4afc-bc1f-f7318c6c6334).
- **App polish shipped:** branded launch stage (2s icon → 5s wordmark), the real
  ministry mark on every icon, "CBS Kenya" home-screen label, back button named,
  static pages now update over the air.
- **Ben's item 2 (numbering on the pictures) is parked** — target undecided.
- Untested even on the simulator: mini-player docking above the tab bar, and video
  playback/download.

## Next action
1. **Contact Us page → Obed Forms web form**, so no email address is posted on the
   page. Ask Jamison what Obed Forms is and where it lives before designing this —
   it is not used or documented anywhere in this repo. The page is CMS resource
   **Contact Us (6)**, linked from the footer and the About page.
2. Full-booklet download in the app (approved, not started): pipeline reads the
   index page's `full_story_pdf` TV → manifest → collection screen.
3. About page "View More" links: `pipeline/src/parse.ts` `parseStaticPage` keeps
   paragraph text and drops anchors, so three lines dangle in the app.
4. Dark mode in Settings — the app follows the system with no override
   (`app/src/hooks/use-color-scheme.ts`).

## Gotchas
- **CMS uploads die over 2 MB** (PHP, not the CMS setting). Recompress per §6.
- The full-booklet link is a TV on the *index* resource (Sonship EN 195, SW 208,
  CBS SW 22), not a story page — the crawler has never captured it.
- Two sessions committing in one repo sweep up each other's unstaged files; §13's
  write-up landed inside another session's commit that way.
- `app/src/lib/db.ts` has **no migration path** (all `CREATE TABLE IF NOT EXISTS`).
- Keep Finder out of `app/ios/Pods` during a build — a `.DS_Store` written mid-delete
  is what broke the iOS build today.
