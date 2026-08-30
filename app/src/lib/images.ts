// Resolve a story's cloth-art image to an expo-image source.
// Filenames are content hashes, so a given path lives either in the app
// binary (bundled at build time) or in the document directory (downloaded
// by an OTA content update) — never both.

import { File } from 'expo-file-system';
import { bundledImages } from '../content/bundled-images';
import { imagesDir } from './downloads';

export function imageSource(imagePath: string | null): number | { uri: string } | null {
  if (!imagePath) return null;
  const bundled = bundledImages[imagePath];
  if (bundled !== undefined) return bundled;
  const file = new File(imagesDir, imagePath.replace(/^images\//, ''));
  if (file.exists) return { uri: file.uri };
  return null;
}
