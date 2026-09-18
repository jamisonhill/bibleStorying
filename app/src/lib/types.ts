// Shared content types. These mirror the pipeline's published manifest
// (pipeline/src/schema.ts) — if the manifest schemaVersion changes, both
// sides change together.

export type LangCode = 'en' | 'sw' | 'ma' | 'br';
export type CollectionId = 'cbs' | 'sonship' | 'acts';

export const LANGUAGE_NAMES: Record<LangCode, string> = {
  en: 'English',
  sw: 'Kiswahili',
  ma: 'Maa',
  br: 'Borana',
};

export interface RemoteFile {
  url: string;
  bytes: number;
}

export interface BundledFile {
  path: string;
  sha256: string;
  bytes: number;
}

/** A story row as stored in SQLite (paragraphs JSON-encoded in the table). */
export interface Story {
  id: string;
  collection: CollectionId;
  lang: LangCode;
  order: number;
  crossKey: string;
  title: string;
  scriptureRef: string;
  paragraphs: string[];
  imagePath: string | null;
  imageSha: string | null;
  audio: RemoteFile | null;
  doc: (RemoteFile & { kind: string }) | null;
  textSha: string;
}

/**
 * A teaching video. Unlike stories these are not per-language and not crawled
 * from the website — they are declared in pipeline/videos.json. The file itself
 * is downloaded on demand, like audio; the poster ships with the bundle.
 */
export interface Video {
  id: string;
  title: string;
  order: number;
  durationSec: number;
  posterPath: string | null;
  posterSha: string | null;
  file: RemoteFile;
}

export interface CollectionLang {
  id: CollectionId;
  lang: LangCode;
  title: string;
  storyIds: string[];
  /** The whole collection as one printable PDF on the live site, if the index page offers one. */
  booklet: RemoteFile | null;
}

/**
 * A tappable run inside a static page paragraph: which paragraph, the exact
 * anchor text within it, and where it goes. Paragraphs themselves stay plain
 * strings; the About screen splits them around these runs.
 */
export interface PageLink {
  paragraph: number;
  text: string;
  href: string;
}

export interface InfoPage {
  id: string;
  title: string;
  paragraphs: string[];
  links: PageLink[];
}

/** manifest.json as published by the pipeline. */
export interface Manifest {
  schemaVersion: number;
  contentVersion: number;
  generatedAt: string;
  collections: {
    id: CollectionId;
    title: string;
    /** `booklet` is absent from bundles published before booklets were crawled. */
    languages: { lang: LangCode; storyIds: string[]; booklet?: RemoteFile | null }[];
  }[];
  stories: Record<
    string,
    {
      id: string;
      collection: CollectionId;
      lang: LangCode;
      order: number;
      crossKey: string;
      title: string;
      scriptureRef: string;
      text: BundledFile;
      image: BundledFile | null;
      audio: RemoteFile | null;
      doc: (RemoteFile & { kind: string }) | null;
    }
  >;
  pages: Record<string, { id: string; title: string; text: BundledFile }>;
  /** Optional: bundles published before videos existed simply omit this. */
  videos?: Record<
    string,
    {
      id: string;
      title: string;
      order: number;
      durationSec: number;
      poster: BundledFile | null;
      file: RemoteFile;
    }
  >;
}

/** Full story body as published in stories/*.json and inlined in the seed. */
export interface StoryBody {
  id: string;
  collection: CollectionId;
  lang: LangCode;
  order: number;
  crossKey: string;
  title: string;
  scriptureRef: string;
  paragraphs: string[];
  image: BundledFile | null;
  audio: RemoteFile | null;
  doc: (RemoteFile & { kind: string }) | null;
}
