# Resume — Bible Storying Kenya app

**Paused:** 2026-09-17 · **Reason:** Phase 10 items all built; waiting on Ben to publish the
Contact Us page · **Phase/Task:** Phase 10 done → Phase 9 (publishing) still blocked on the
client's developer accounts
**Tree:** clean after this session's commits · see `git log` for the four commits of 2026-09-17

## State
- **Contact Us is an Obed Forms form.** `cbs-kenya-contact` on forms.duski.org (published,
  v2, Turnstile on), emails hello@biblestoryingkenya.com. CMS resource 6 holds the intro text
  (content) + the iframe (the `form` TV, right column); it is saved **unpublished** and
  preview-verified. **Ben ticks Published** — until then `/contact-us.html` 404s for everyone,
  including the About page's "Contact Us" link in the app. RUNBOOK §6 "Contact form".
- **App (verified on the iPhone 17 Pro simulator):** More → Contact Us opens the form in an
  in-app browser sheet; Settings → Appearance (Automatic/Light/Dark) switches instantly and
  survives relaunch; collection screen shows "Full booklet (PDF, n MB)"; About links are
  tappable. `db.ts` now has `ensureColumn()` — the first migration path.
- **Pipeline:** publishes `booklet` per collection language and `links` per static page.
  Content v6 built locally and committed; CI republishes nightly (or `gh workflow run
  "Update content bundle"` after pushing).
- **Not done:** no test submission was sent through the form (it would land in Ben's inbox).
  Ben's item 2 (numbering on the pictures) is still parked.

## Next action
1. Push, then confirm the live manifest reaches v6 (RUNBOOK §13 has the curl).
2. Ask Ben to tick Published on Contact Us (6) and confirm a real message arrives at hello@.
3. Obed Forms `c627fb2` (pushed, NOT yet deployed) makes the public form's document follow
   the theme and renders Turnstile in the matching theme — that removes the dark Turnstile
   box on the CMS page for dark-mode visitors. Deploy per obed-forms RUNBOOK §7:
   `./infra/deploy.sh c627fb2`. **Deployed 2026-09-18**, healthz reports c627fb2. The iframe is now 1040px tall (CMS TV + `website/`), which
   already removed the inner scrollbar and its dark track.
4. Phase 9 once the client opens developer accounts.

## Gotchas
- **This Mac's checkout had no `node_modules`** in `pipeline/` or `app/` — that was the whole
  "local npm run build failure". `npm ci` in each.
- **RUNBOOK §13's React.xcframework recovery is missing** — RESUME and PROGRESS point at it,
  but the section was never (or no longer) in the file. The build worked first time this
  session via plain `npx expo run:ios --device <udid>` (prebuild + pods, ~10 min), so it may
  not be needed; if it breaks again, write the recovery up properly.
- Two simulators were booted (17 Pro + 17 Pro Max) plus an iPad; screen taps via cliclick go
  to whichever window is frontmost — raise the right one first.
- Deep links (`biblestoryingkenya://…`) prompt "Open in CBS Kenya?" every time on the simulator.
- CMS: both the content field and the `form` TV are TinyMCE instances; set values through
  `tinymce.get(id).setContent()`, never the hidden textarea.
- The forms.duski.org API key minted for this errand is revoked. Mint a new one for the next.
