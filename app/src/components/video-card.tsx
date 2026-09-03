// A teaching film in the Videos tab: poster artwork with a play badge, the
// running time, and a one-line status showing whether it is on the phone yet.

import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DownloadState } from '@/lib/downloads';
import { formatBytes, formatTime } from '@/lib/format';
import { imageSource } from '@/lib/images';
import type { Video } from '@/lib/types';
import { CheckCircleIcon, PlayIcon } from './icons';

interface Props {
  video: Video;
  state: DownloadState;
  onPress: () => void;
}

export function VideoCard({ video, state, onPress }: Props) {
  const theme = useTheme();
  const source = imageSource(video.posterPath);

  // One line that answers "can I watch this right now, and if not what will
  // it cost me?" — the only question worth asking on a metered connection.
  const status =
    state.phase === 'done'
      ? 'Downloaded'
      : state.phase === 'downloading'
        ? `Downloading… ${Math.round(state.progress * 100)}%`
        : state.phase === 'error'
          ? 'Download failed — tap to retry'
          : `Not downloaded · ${formatBytes(video.file.bytes)}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${video.title}, ${formatTime(video.durationSec)}. ${status}`}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.artWrap, { backgroundColor: theme.surfaceAlt }]}>
        {source && (
          <Image source={source} style={styles.art} contentFit="cover" transition={150} />
        )}
        <View style={styles.playBadge}>
          <PlayIcon size={22} color="#FFFFFF" />
        </View>
        <View style={styles.duration}>
          <Text style={styles.durationText}>{formatTime(video.durationSec)}</Text>
        </View>
        {state.phase === 'done' && (
          <View style={[styles.badge, { backgroundColor: theme.surface }]}>
            <CheckCircleIcon size={16} color={theme.success} />
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
        {video.title}
      </Text>
      <Text style={[styles.status, { color: theme.textSecondary }]} numberOfLines={1}>
        {status}
      </Text>
      {state.phase === 'downloading' && (
        <View style={[styles.track, { backgroundColor: theme.separator }]}>
          <View
            style={[
              styles.fill,
              { backgroundColor: theme.accent, width: `${Math.round(state.progress * 100)}%` },
            ]}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 4 },
  artWrap: { borderRadius: radius.card, overflow: 'hidden', aspectRatio: 16 / 9 },
  art: { width: '100%', height: '100%' },
  playBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -22,
    marginLeft: -22,
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    // Fixed translucent black rather than a theme token: it sits on top of
    // photographic artwork, where a surface colour would disappear.
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  badge: { position: 'absolute', top: 8, right: 8, borderRadius: radius.pill, padding: 3 },
  title: { fontSize: 16, fontWeight: '600', marginTop: 10, lineHeight: 21 },
  status: { fontSize: 13, marginTop: 2 },
  track: { height: 3, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
});
