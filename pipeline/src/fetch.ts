// Small fetch helpers: retries, concurrency limiting, and HEAD size lookups.

import pLimit from 'p-limit';
import { FETCH_CONCURRENCY, USER_AGENT } from './config.ts';

const limit = pLimit(FETCH_CONCURRENCY);

/**
 * Fetch a URL with up to 3 attempts (network blips are common; a transient
 * failure should not kill a 250-page crawl). Throws after the last attempt.
 */
async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { 'user-agent': USER_AGENT, ...init?.headers },
        signal: AbortSignal.timeout(60_000),
      });
      // Retry server errors; 4xx are permanent and surface immediately.
      if (res.status >= 500) throw new Error(`HTTP ${res.status} for ${url}`);
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
  throw new Error(`Failed to fetch ${url} after 3 attempts: ${String(lastError)}`);
}

/** GET a page as text (HTML/XML). Throws on any non-OK status. */
export function fetchText(url: string): Promise<string> {
  return limit(async () => {
    const res = await fetchWithRetry(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
  });
}

/** GET a binary file (images). Throws on any non-OK status. */
export function fetchBytes(url: string): Promise<Buffer> {
  return limit(async () => {
    const res = await fetchWithRetry(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return Buffer.from(await res.arrayBuffer());
  });
}

/**
 * HEAD request returning the file size in bytes, or null if the file is
 * missing (a broken link on the site should not fail the whole build —
 * the story is published without that file and the issue is logged).
 */
export function headBytes(url: string): Promise<number | null> {
  return limit(async () => {
    const res = await fetchWithRetry(url, { method: 'HEAD' });
    if (!res.ok) return null;
    const len = res.headers.get('content-length');
    const bytes = len ? Number.parseInt(len, 10) : Number.NaN;
    return Number.isFinite(bytes) && bytes > 0 ? bytes : null;
  });
}
