// Loads the hand-maintained videos.json.
//
// Unlike stories, videos never appeared on biblestoryingkenya.com — they are
// teaching films handed over as raw masters. There is nothing to crawl, so the
// list is declared by hand and validated here with the same fail-loud rule as
// the rest of the pipeline: a malformed config stops the build rather than
// publishing a bundle with videos missing.

import fs from 'node:fs/promises';
import { VideosConfigSchema, type VideoConfig } from './schema.ts';

/**
 * Validate a parsed videos.json. Pure and exported so tests can exercise it
 * without touching the filesystem or the network.
 *
 * Throws when the config is malformed, when two entries share a slug, or when
 * two entries claim the same order — both would make the Videos tab's ordering
 * arbitrary, which is the kind of silent drift this pipeline refuses to ship.
 */
export function parseVideosConfig(raw: unknown): VideoConfig[] {
  const { videos } = VideosConfigSchema.parse(raw);

  const seenSlugs = new Set<string>();
  const seenOrders = new Map<number, string>();
  for (const video of videos) {
    if (seenSlugs.has(video.slug)) {
      throw new Error(`videos.json: duplicate slug "${video.slug}"`);
    }
    seenSlugs.add(video.slug);

    const clash = seenOrders.get(video.order);
    if (clash !== undefined) {
      throw new Error(
        `videos.json: "${video.slug}" and "${clash}" both claim order ${video.order}`,
      );
    }
    seenOrders.set(video.order, video.slug);
  }

  return [...videos].sort((a, b) => a.order - b.order);
}

/** Read and validate videos.json from disk. Missing file = no videos, not an error. */
export async function loadVideosConfig(configPath: string): Promise<VideoConfig[]> {
  let raw: string;
  try {
    raw = await fs.readFile(configPath, 'utf8');
  } catch (err) {
    // A repo without videos.json is a valid state — the app just shows no videos.
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
  return parseVideosConfig(JSON.parse(raw));
}
