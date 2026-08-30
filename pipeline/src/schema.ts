// Zod schemas for everything the pipeline publishes.
// The site is hand-edited, so structure drift is the #1 risk: every parsed
// story is validated here and the build FAILS LOUDLY rather than publishing
// a broken bundle.

import { z } from 'zod';

/** A downloadable file that stays on the live website (audio, docs). */
export const RemoteFileSchema = z.object({
  /** Absolute URL on biblestoryingkenya.com. */
  url: z.string().url(),
  /** Size in bytes (from a HEAD request) so the app can show sizes upfront. */
  bytes: z.number().int().positive(),
});

/** A file that is mirrored into the content bundle (story text, images). */
export const BundledFileSchema = z.object({
  /** Path inside the bundle, e.g. "images/ab12cd34ef56.webp". */
  path: z.string().min(1),
  /** SHA-256 of the file — the app uses this for delta updates. */
  sha256: z.string().length(64),
  bytes: z.number().int().positive(),
});

/** One story in one language. */
export const StorySchema = z.object({
  /** Stable id: "<collection>/<lang>/<slug>", e.g. "cbs/en/satan-tests-jesus". */
  id: z.string().regex(/^[a-z]+\/[a-z]{2}\/[a-z0-9._-]+$/),
  collection: z.enum(['cbs', 'sonship', 'acts']),
  lang: z.enum(['en', 'sw', 'ma', 'br']),
  slug: z.string().min(1),
  /** Position within its collection+language list (the site's own order). */
  order: z.number().int().nonnegative(),
  /**
   * Links the same story across languages, so the app can switch a story
   * from Swahili to Maasai in place. Derived from the shared storying-cloth
   * artwork number (bsk_28.jpg → "bsk_28") or list position as a fallback.
   */
  crossKey: z.string().min(1),
  title: z.string().min(1),
  /** e.g. "Matthew 4:1-11, Luke 4:1-13" — may be empty on a few pages. */
  scriptureRef: z.string(),
  /** The story text as clean paragraphs (entities decoded, no markup).
   *  May be empty for the few audio/document-only stories. */
  paragraphs: z.array(z.string().min(1)),
  /** Storying-cloth artwork, mirrored into the bundle. Null when absent. */
  image: BundledFileSchema.nullable(),
  /** MP3 on the live site; downloaded on demand by the app. Null when absent. */
  audio: RemoteFileSchema.nullable(),
  /** DOCX/PDF handout on the live site. Null when absent. */
  doc: RemoteFileSchema.extend({ kind: z.enum(['pdf', 'doc', 'docx']) }).nullable(),
  /** Source page, for traceability and "view on website". */
  sourceUrl: z.string().url(),
});
export type Story = z.infer<typeof StorySchema>;

/** A static informational page (About CBS). */
export const PageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  sourceUrl: z.string().url(),
});
export type Page = z.infer<typeof PageSchema>;

/** One language's story list inside a collection. */
export const CollectionLangSchema = z.object({
  lang: z.enum(['en', 'sw', 'ma', 'br']),
  /** Ordered story ids. Empty = the site has a placeholder page (no stories yet). */
  storyIds: z.array(z.string()),
});

export const CollectionSchema = z.object({
  id: z.enum(['cbs', 'sonship', 'acts']),
  title: z.string().min(1),
  languages: z.array(CollectionLangSchema).min(1),
});

/** The top-level manifest the app polls for updates. */
export const ManifestSchema = z.object({
  schemaVersion: z.literal(1),
  /** Monotonically increasing; bumped whenever any published file changes. */
  contentVersion: z.number().int().positive(),
  generatedAt: z.string(),
  collections: z.array(CollectionSchema),
  /** Story metadata + file references, keyed by story id. */
  stories: z.record(
    z.string(),
    z.object({
      id: z.string(),
      collection: z.string(),
      lang: z.string(),
      order: z.number().int(),
      crossKey: z.string(),
      title: z.string(),
      scriptureRef: z.string(),
      text: BundledFileSchema,
      image: BundledFileSchema.nullable(),
      audio: RemoteFileSchema.nullable(),
      doc: RemoteFileSchema.extend({ kind: z.string() }).nullable(),
    }),
  ),
  pages: z.record(z.string(), z.object({ id: z.string(), title: z.string(), text: BundledFileSchema })),
});
export type Manifest = z.infer<typeof ManifestSchema>;

/** Crawl state persisted between runs for incremental builds. */
export const StateSchema = z.object({
  contentVersion: z.number().int().positive(),
  /** sitemap <lastmod> per page URL at the time we last parsed it. */
  pageLastmod: z.record(z.string(), z.string()),
  /** HEAD-request byte sizes per remote file URL (audio/docs), cached. */
  remoteBytes: z.record(z.string(), z.number()),
});
export type State = z.infer<typeof StateSchema>;
