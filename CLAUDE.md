# Bible Storying Kenya — project notes

Offline iOS/Android Expo app + content pipeline for biblestoryingkenya.com.
Full architecture in README.md. Key facts:

- `pipeline/` Node 24+ TypeScript (native type-stripping — run `.ts` directly
  with `node`, no build step). `npm test` = parser tests against fixtures in
  `pipeline/test/fixtures/`. `node src/build.ts` = incremental crawl,
  `--full` = re-parse everything.
- `content/` is GENERATED — never hand-edit. Regenerate via the pipeline.
- `app/` Expo SDK 57. After content changes run `npm run seed` (regenerates
  `app/src/content/seed.json` + `bundled-images.ts` + copies webp assets).
  `app/src/content/` and `app/assets/content/` are generated too.
- The site is hand-edited static HTML: parsers must fail loudly, never
  publish partial bundles.
- Bundle IDs (`com.biblestoryingkenya.app`) and the content base URL in
  `app/src/lib/updater.ts` are placeholders until the client's developer
  accounts / the GitHub repo exist.
- Checks before committing: `cd pipeline && npm test` and
  `cd app && npx tsc --noEmit`.
