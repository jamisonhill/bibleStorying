// Video screen: download the film, then watch it offline.
//
// Deliberately download-then-watch rather than streaming. These files are
// 20–45 MB and the audience is on metered, often intermittent connections —
// a half-buffered stream that stalls mid-teaching is worse than a download
// that finishes once and plays forever.

import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DownloadIcon, TrashIcon } from '@/components/icons';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getVideo } from '@/lib/db';
import {
  deleteVideo, downloadVideo, downloadsVersion, localVideoUri, subscribeDownloads,
  videoDownloadStateFor,
} from '@/lib/downloads';
import { formatBytes, formatTime } from '@/lib/format';
import { imageSource } from '@/lib/images';
import { stopPlayback } from '@/lib/player';

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const video = useMemo(() => (id ? getVideo(id) : null), [id]);
  useSyncExternalStore(subscribeDownloads, downloadsVersion);

  const state = video ? videoDownloadStateFor(video.id) : { phase: 'idle' as const, progress: 0 };
  const localUri = video ? localVideoUri(video.id) : null;

  // The story player is a separate audio-only singleton. Without this, a story
  // would keep playing underneath the film.
  useEffect(() => {
    stopPlayback();
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: video?.title ?? '' });
  }, [navigation, video?.title]);

  const player = useVideoPlayer(localUri ? { uri: localUri } : null, (p) => {
    p.loop = false;
  });

  if (!video) {
    return (
      <View style={[styles.missing, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>This video is no longer available.</Text>
      </View>
    );
  }

  const poster = imageSource(video.posterPath);

  const onDownloadPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    downloadVideo(video).catch((err) => {
      const message = String(err);
      if (message.includes('wifi-only')) {
        Alert.alert(
          'Waiting for Wi-Fi',
          'Downloads are set to Wi-Fi only, to protect your mobile data. You can change this in Settings.',
        );
      } else if (message.includes('offline')) {
        Alert.alert('Offline', 'Connect to the internet to download this video.');
      } else {
        Alert.alert('Download failed', 'Something went wrong. Please try again.');
      }
    });
  };

  const confirmDelete = () => {
    Alert.alert(
      'Remove downloaded video?',
      `This frees ${formatBytes(video.file.bytes)}. You can download it again at any time.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteVideo(video.id) },
      ],
    );
  };

  const downloading = state.phase === 'downloading';

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
    >
      <View style={[styles.stage, { backgroundColor: theme.surfaceAlt }]}>
        {localUri ? (
          <VideoView
            player={player}
            style={styles.stageFill}
            nativeControls
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture
            contentFit="contain"
          />
        ) : (
          poster && <Image source={poster} style={styles.stageFill} contentFit="cover" transition={200} />
        )}
      </View>

      <Text style={[styles.title, { color: theme.text }]}>{video.title}</Text>
      <Text style={[styles.meta, { color: theme.textSecondary }]}>
        {formatTime(video.durationSec)} · {formatBytes(video.file.bytes)}
      </Text>

      {localUri ? (
        <Pressable
          onPress={confirmDelete}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <TrashIcon size={18} color={theme.danger} />
          <Text style={[styles.actionText, { color: theme.danger }]}>Remove download</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={onDownloadPress}
          disabled={downloading}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: theme.accent, opacity: pressed || downloading ? 0.75 : 1 },
          ]}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={theme.textOnAccent} />
          ) : (
            <DownloadIcon size={18} color={theme.textOnAccent} />
          )}
          <Text style={[styles.actionText, { color: theme.textOnAccent, fontWeight: '600' }]}>
            {downloading
              ? `Downloading… ${Math.round(state.progress * 100)}%`
              : `Download to watch (${formatBytes(video.file.bytes)})`}
          </Text>
        </Pressable>
      )}

      {downloading && (
        <View style={[styles.track, { backgroundColor: theme.separator }]}>
          <View
            style={[
              styles.fill,
              { backgroundColor: theme.accent, width: `${Math.round(state.progress * 100)}%` },
            ]}
          />
        </View>
      )}

      {!localUri && !downloading && (
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Once downloaded, this video plays with no connection at all.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  stage: { borderRadius: radius.card, overflow: 'hidden', aspectRatio: 16 / 9 },
  stageFill: { width: '100%', height: '100%' },
  title: { fontSize: 22, fontWeight: '700', marginTop: 18, lineHeight: 28 },
  meta: { fontSize: 14, marginTop: 4 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.control,
    paddingVertical: 14,
    marginTop: 20,
  },
  actionText: { fontSize: 15 },
  track: { height: 3, borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  note: { fontSize: 13, lineHeight: 19, marginTop: 12, textAlign: 'center' },
});
