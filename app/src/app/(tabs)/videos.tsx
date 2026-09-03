// Videos tab: teaching films about Chronological Bible Storying.
//
// Unlike stories these are not per-language and not crawled from the website —
// they are declared in pipeline/videos.json. Each file is large (roughly 20–45
// MB), so nothing downloads until the user asks for it, and the Wi-Fi-only
// setting applies exactly as it does to story audio.

import { useRouter } from 'expo-router';
import { useMemo, useSyncExternalStore } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoCard } from '@/components/video-card';
import { MINI_PLAYER_SPACE, TAB_BAR_HEIGHT } from '@/constants/layout';
import { useTheme } from '@/hooks/use-theme';
import { getVideos } from '@/lib/db';
import { downloadsVersion, subscribeDownloads, videoDownloadStateFor } from '@/lib/downloads';

export default function VideosScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const videos = useMemo(() => getVideos(), []);

  // Re-render on any download state change (badges + progress bars).
  useSyncExternalStore(subscribeDownloads, downloadsVersion);

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 24,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + MINI_PLAYER_SPACE,
        },
      ]}
      data={videos}
      keyExtractor={(v) => v.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Videos</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Teaching films about Chronological Bible Storying.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          No videos yet. They will appear here when they are published.
        </Text>
      }
      renderItem={({ item }) => (
        <VideoCard
          video={item}
          state={videoDownloadStateFor(item.id)}
          onPress={() => router.push(`/video/${item.id}`)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 22 },
  header: { marginBottom: 2 },
  screenTitle: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  tagline: { fontSize: 15, lineHeight: 21, marginTop: 8 },
  empty: { fontSize: 15, textAlign: 'center', marginTop: 40 },
});
