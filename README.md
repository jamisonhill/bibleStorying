# Bible Storying Kenya — Offline App

> ⚠️ If you are taking this project over, read RUNBOOK.md first.

A fully-offline iOS + Android app for [biblestoryingkenya.com](https://biblestoryingkenya.com):
228 Chronological Bible Storying stories across 3 collections (CBS, Sonship,
Book of Acts) and 4 languages (English, Kiswahili, Maa, Borana) — text, cloth
artwork, and audio — with content that updates itself when the website changes.

## How it fits together

```
biblestoryingkenya.com  (static site, hand-edited)
        │  daily crawl (GitHub Action, sitemap lastmod diff)
        ▼
  pipeline/   parses pages → validates → content bundle
        │  commit + publish
        ▼
  content/    manifest.json (versioned, per-file SHA-256)
              stories/*.json · images/*.webp (~3.4MB total)
              → published to GitHub Pages
        │                          │
        │  bundled at build time   │  polled ~daily by the app
        ▼                          ▼
  app/        Expo (React Native) app — everything offline:
              text+images ship in the binary (~6MB payload);
              audio (548MB total) stays on the website and is
              downloaded per story / per collection on request.
```

- **Fully offline:** every story's text, scripture reference, and artwork works
  with no connection from first launch. Audio is downloaded by choice
  (per story or "download all" per collection), Wi-Fi-only by default.
- **Self-updating content:** the app checks `manifest.json` at most once a day
  when online and silently fetches only changed story text/images (hash-diffed).
  Changed audio is never re-downloaded silently — the story shows
  "Update audio" instead. App code never self-updates (store-compliant).
- **Fail-loud pipeline:** the site is hand-edited; if its markup drifts, the
  crawl fails validation, publishes nothing, and auto-opens a GitHub issue.

## Repo layout

| Path | What |
|---|---|
| `pipeline/` | TypeScript crawler/parser (`npm run build`, `npm test`). `node src/build.ts --full` forces a full re-crawl. |
| `content/` | Generated bundle (committed). `manifest.json` is the app's update contract. |
| `app/` | Expo app. `npm run seed` regenerates `src/content/` from `../content`. |
| `.github/workflows/content-update.yml` | Daily crawl → commit → publish to Pages. |

## Development

```bash
# refresh content from the live site
cd pipeline && npm ci && node src/build.ts

# run the app
cd app && npm ci && npm run seed && npx expo start
```

## Publishing checklist (when developer accounts exist)

The client will open the Apple Developer ($99/yr) and Google Play ($25 once)
accounts. Then:

1. **Bundle IDs** — `com.biblestoryingkenya.app` is a placeholder in
   `app/app.json` (`ios.bundleIdentifier`, `android.package`); confirm or
   change before the first store upload (it is permanent after that).
2. **Content URL** — push this repo to GitHub, enable Pages
   (Settings → Pages → Source: GitHub Actions), then set the real URL in
   `app/src/lib/updater.ts` (`DEFAULT_CONTENT_BASE_URL`).
3. **EAS** — `npm i -g eas-cli && eas init && eas build --platform all`
   (EAS free tier covers this). Submit with `eas submit`.
4. **Store listings** — screenshots from the app, description from the site's
   own wording; privacy: no accounts, no analytics, no data collected
   ("Data Not Collected" label on iOS, no Data Safety disclosures needed
   beyond "no data shared/collected" on Play).
5. **Android target API** — Expo SDK releases track Play's yearly
   target-API requirement; rebuild with the current SDK before each
   yearly deadline (Aug 31).

## Design decisions (research-backed)

- Image-first navigation (cloth-art cards) for oral learners; 3-level
  hierarchy: Home → Collection grid → Story. No search, accounts, or
  notifications in v1.
- Audio-first story screen: large play button, ±15s skip, tap-to-seek,
  speed cycle (1 → 1.25 → 1.5 → 0.75), repeat toggle, resume position,
  background/lock-screen playback with artwork.
- In-place language switching per story via `crossKey` (shared cloth-art
  number) — study in Kiswahili, tell in Maa.
- Android minSdk 26, iOS 16.4+ — covers the low-end Tecno/Infinix/Itel
  devices that dominate the Kenyan market.
