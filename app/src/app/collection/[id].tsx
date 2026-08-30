// Collection screen: 2-column grid of story cards in the chosen language,
// with in-place language switching and a "download all audio" action.

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DownloadIcon } from '@/components/icons';
import { LanguageChips } from '@/components/language-chips';
import { StoryCard } from '@/components/story-card';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCollections, getStoriesFor } from '@/lib/db';
import {
  downloadStateFor, downloadsVersion, queueCollectionDownload, subscribeDownloads,
} from '@/lib/downloads';
import { formatBytes } from '@/lib/format';
import { useLanguage } from '@/lib/language-context';
import type { CollectionId, LangCode } from '@/lib/types';

export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const collectionId = id as CollectionId;
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { lang: globalLang } = useLanguage();

  // The screen's language starts from the app-wide choice but can diverge
  // (a user may browse Maasai here while the app default stays Swahili).
  const [lang, setLang] = useState<LangCode>(globalLang);

  const collections = useMemo(() => getCollections(), []);
  const available = useMemo(
    () =>
      (['en', 'sw', 'ma', 'br'] as LangCode[]).filter((l) =>
        collections.some((c) => c.id === collectionId && c.lang === l && c.storyIds.length > 0),
      ),
    [collections, collectionId],
  );
  const effectiveLang = available.includes(lang) ? lang : available[0];
  const stories = useMemo(
    () => (effectiveLang ? getStoriesFor(collectionId, effectiveLang) : []),
    [collectionId, effectiveLang],
  );

  const title = collections.find((c) => c.id === collectionId)?.title ?? '';
  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  // Re-render on any download state change (badges + progress).
  useSyncExternalStore(subscribeDownloads, downloadsVersion);

  const undownloaded = stories.filter(
    (s) => s.audio && downloadStateFor(s.id).phase === 'idle',
  );
  const undownloadedBytes = undownloaded.reduce((sum, s) => sum + (s.audio?.bytes ?? 0), 0);
  const activeCount = stories.filter((s) => {
    const phase = downloadStateFor(s.id).phase;
    return phase === 'downloading' || phase === 'queued';
  }).length;

  const confirmDownloadAll = () => {
    Alert.alert(
      'Download all audio?',
      `${undownloaded.length} stories, about ${formatBytes(undownloadedBytes)}. Files are saved on this phone for offline listening.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => queueCollectionDownload(undownloaded) },
      ],
    );
  };

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
      columnWrapperStyle={styles.column}
      numColumns={2}
      data={stories}
      keyExtractor={(s) => s.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <LanguageChips languages={available} selected={effectiveLang} onSelect={setLang} />
          {stories.some((s) => s.audio) && (
            <Pressable
              onPress={confirmDownloadAll}
              disabled={undownloaded.length === 0}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.downloadAll,
                { backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <DownloadIcon size={18} color={theme.text} />
              <Text style={[styles.downloadAllText, { color: theme.text }]}>
                {activeCount > 0
                  ? `Downloading… ${activeCount} left`
                  : undownloaded.length === 0
                    ? 'All audio downloaded'
                    : `Download all audio (${formatBytes(undownloadedBytes)})`}
              </Text>
            </Pressable>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <StoryCard
          story={item}
          downloaded={downloadStateFor(item.id).phase === 'done'}
          onPress={() => router.push(`/story/${item.id}`)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 20 },
  column: { gap: 16 },
  header: { gap: 14, marginBottom: 4 },
  downloadAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.control,
    paddingVertical: 12,
  },
  downloadAllText: { fontSize: 15, fontWeight: '500' },
});
