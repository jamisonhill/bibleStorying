# Resume — Bible Storying Kenya app

**Paused:** 2026-09-18 · **Reason:** Phase 10 shipped and simulator-verified; waiting on Ben
(publish Contact Us, confirm test email) and on the client's developer accounts
**Phase/Task:** Phase 6 beta testing — awaiting feedback; Phase 9 blocked on accounts
**Tree:** clean · **Last commit:** 6fd2379 app: download state never refreshed on screen under the React Compiler

## State
- Content v6 is live on GitHub Pages (booklets + About links). Local and origin are in sync;
  the nightly bot commits `content: update bundle` daily — pull before working.
- Contact Us: Obed Forms `cbs-kenya-contact` (v2, live, Turnstile on) → hello@biblestoryingkenya.com.
  CMS resource 6 is updated and saved **unpublished**; Jamison sent a live test on 2026-09-18.
  Obed Forms `c627fb2` (theme follows form, not browser) is deployed on forms.duski.org.
- App verified on the iPhone 17 Pro simulator: dark mode, Contact Us, booklets, About links,
  mini-player docking, video + audio download and playback.
- Fixed: download state never refreshed on screen (React Compiler memoised the store reads);
  five screens now carry `'use no memo'`. Testers' builds predate this — they need a new build.
- Not done: no Android device; Ben's item 2 (picture numbering) parked.

## Next action
1. When Ben confirms the email and publishes resource 6, curl
   `https://www.biblestoryingkenya.com/contact-us.html` → expect 200 and the iframe.
2. Cut new tester builds (RUNBOOK §7) so Duski and Ben get the download-state fix.
3. Phase 9 once the client opens developer accounts (app/app.json placeholders).

## Gotchas
- Fresh checkout on this Mac had no `node_modules` in `pipeline/` or `app/` — `npm ci` in each.
- `npx expo run:ios --device <udid>` worked first time (~10 min). Do not run it with `CI=1`:
  Metro then disables reloads and Fast Refresh silently stops applying edits.
- Two simulators + an iPad were booted; cliclick taps go to whichever window is frontmost.
- Both CMS fields on resource 6 are TinyMCE instances — set via `tinymce.get(id).setContent()`.
- Obed Forms API keys are minted per errand and revoked after; the last one is dead.
