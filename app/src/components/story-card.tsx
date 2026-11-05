// A story in the collection grid: cloth artwork with the title below,
// the story's number in the top-left corner, and a small badge when its
// audio is downloaded.

import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { imageSource } from '@/lib/images';
import type { Story } from '@/lib/types';
import { CheckCircleIcon } from './icons';

interface Props {
  story: Story;
  downloaded: boolean;
  onPress: () => void;
}

export function StoryCard({ story, downloaded, onPress }: Props) {
  const theme = useTheme();
  const source = imageSource(story.imagePath);
  // `order` is the 0-based position in the website's list, so story 1 is the
  // first one shown there. That keeps the app's numbers matching the site's.
  const storyNumber = story.order + 1;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Story ${storyNumber}. ${story.title}. ${story.scriptureRef}`}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[styles.artWrap, { backgroundColor: theme.surfaceAlt }]}>
        {source ? (
          <Image source={source} style={styles.art} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.art, styles.artFallback]}>
            <Text style={[styles.artFallbackText, { color: theme.textSecondary }]}>
              {story.title.slice(0, 1)}
            </Text>
          </View>
        )}
        <View style={[styles.number, { backgroundColor: theme.surface }]}>
          <Text style={[styles.numberText, { color: theme.text }]}>{storyNumber}</Text>
        </View>
        {downloaded && (
          <View style={[styles.badge, { backgroundColor: theme.surface }]}>
            <CheckCircleIcon size={16} color={theme.success} />
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
        {story.title}
      </Text>
      <Text style={[styles.ref, { color: theme.textSecondary }]} numberOfLines={1}>
        {story.scriptureRef}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  artWrap: {
    borderRadius: radius.card,
    overflow: 'hidden',
    aspectRatio: 4 / 3,
  },
  art: { width: '100%', height: '100%' },
  artFallback: { alignItems: 'center', justifyContent: 'center' },
  artFallbackText: { fontSize: 40, fontWeight: '300' },
  number: {
    position: 'absolute',
    top: 8,
    left: 8,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: radius.pill,
    padding: 3,
  },
  title: { fontSize: 15, fontWeight: '600', marginTop: 8, lineHeight: 20 },
  ref: { fontSize: 12, marginTop: 2 },
});
