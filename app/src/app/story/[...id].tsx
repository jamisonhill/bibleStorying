// Story screen: cloth artwork, audio-first player (play/pause, skip ±15s,
// tap-to-seek, speed, repeat), in-place language switching via the shared
// crossKey, the story text in a readable serif, and audio/document actions.

import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import * as Network from 'expo-network';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState, useSyncExternalStore } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircleIcon, DocIcon, DownloadIcon, PauseIcon, PlayIcon,
  RepeatIcon, SkipBackIcon, SkipForwardIcon, TrashIcon,
} from '@/components/icons';
import { LanguageChips } from '@/components/language-chips';
import { radius, storyFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getStory, getTranslation } from '@/lib/db';
import {
  deleteAudio, downloadAudio, downloadStateFor, downloadsVersion,
  isAudioStale, localAudioUri, subscribeDownloads,
} from '@/lib/downloads';
import { formatBytes, formatTime } from '@/lib/format';
import { imageSource } from '@/lib/images';
import {
  cycleRate, playerState, seekBy, seekTo, subscribePlayer,
  playStory, toggleLoop, togglePlayback,
} from '@/lib/player';
import type { LangCode } from '@/lib/types';

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string[] }>();
  const storyId = Array.isArray(id) ? id.join('/') : (id ?? '');
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const story = useMemo(() => getStory(storyId), [storyId]);

  // Which languages this specific story exists in (via crossKey).
  const translations = useMemo(() => {
    if (!story) return [];
    return (['en', 'sw', 'ma', 'br'] as LangCode[]).filter(
      (l) => l === story.lang || getTranslation(story, l) !== null,
    );
  }, [story]);

  const player = useSyncExternalStore(subscribePlayer, playerState);
  useSyncExternalStore(subscribeDownloads, downloadsVersion);
  const [seekWidth, setSeekWidth] = useState(1);

  if (!story) {
    return (
      <View style={[styles.missing, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Story not found.</Text>
      </View>
    );
  }

  const isCurrent = player.storyId === story.id;
  const download = downloadStateFor(story.id);
  const stale = isAudioStale(story);
  const artwork = imageSource(story.imagePath);

  const switchLanguage = (langCode: LangCode) => {
    if (langCode === story.lang) return;
    const other = getTranslation(story, langCode);
    if (other) router.replace(`/story/${other.id}`);
  };

  const startPlayback = async () => {
    if (!story.audio) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isCurrent) {
      togglePlayback();
      return;
    }
    const localUri = localAudioUri(story.id);
    let uri = localUri;
    if (!uri) {
      const net = await Network.getNetworkStateAsync();
      if (!net.isConnected) {
        Alert.alert(
          'Audio not downloaded',
          'You are offline and this story’s audio has not been downloaded yet. Connect to the internet to listen or download it.',
        );
        return;
      }
      uri = story.audio.url;
    }
    // Lock-screen artwork needs a URI; resolve the bundled asset if needed.
    let artworkUrl: string | undefined;
    if (typeof artwork === 'number') {
      artworkUrl = Asset.fromModule(artwork).uri;
    } else if (artwork) {
      artworkUrl = artwork.uri;
    }
    await playStory(story, uri, artworkUrl);
  };

  const onDownloadPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    downloadAudio(story).catch((err) => {
      const message = String(err);
      if (message.includes('wifi-only')) {
        Alert.alert(
          'Waiting for Wi-Fi',
          'Downloads are set to Wi-Fi only, to protect your mobile data. You can change this in Settings.',
        );
      } else if (message.includes('offline')) {
        Alert.alert('Offline', 'Connect to the internet to download this audio.');
      } else {
        Alert.alert('Download failed', 'Something went wrong. Please try again.');
      }
    });
  };

  const confirmDelete = () => {
    Alert.alert('Remove downloaded audio?', 'You can download it again at any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteAudio(story.id) },
    ]);
  };

  const progress = isCurrent && player.duration > 0 ? player.currentTime / player.duration : 0;

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
    >
      {artwork && (
        <View style={[styles.artWrap, { backgroundColor: theme.surfaceAlt }]}>
          <Image source={artwork} style={styles.art} contentFit="cover" transition={200} />
        </View>
      )}

      <Text style={[styles.title, { color: theme.text }]}>{story.title}</Text>
      {story.scriptureRef !== '' && (
        <Text style={[styles.ref, { color: theme.textSecondary }]}>{story.scriptureRef}</Text>
      )}

      {translations.length > 1 && (
        <View style={styles.chips}>
          <LanguageChips languages={translations} selected={story.lang} onSelect={switchLanguage} />
        </View>
      )}

      {story.audio && (
        <View style={[styles.playerCard, { backgroundColor: theme.surface }]}>
          <View style={styles.controlsRow}>
            <Pressable
              onPress={() => isCurrent && seekBy(-15)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back 15 seconds"
              style={styles.sideBtn}
            >
              <SkipBackIcon size={26} color={isCurrent ? theme.text : theme.textSecondary} />
            </Pressable>

            <Pressable
              onPress={startPlayback}
              accessibilityRole="button"
              accessibilityLabel={isCurrent && player.playing ? 'Pause story' : 'Play story'}
              style={({ pressed }) => [
                styles.playBtn,
                { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              {isCurrent && player.playing ? (
                <PauseIcon size={30} color={theme.textOnAccent} />
              ) : (
                <PlayIcon size={30} color={theme.textOnAccent} />
              )}
            </Pressable>

            <Pressable
              onPress={() => isCurrent && seekBy(15)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Forward 15 seconds"
              style={styles.sideBtn}
            >
              <SkipForwardIcon size={26} color={isCurrent ? theme.text : theme.textSecondary} />
            </Pressable>
          </View>

          <View
            style={styles.seekWrap}
            onLayout={(e) => setSeekWidth(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => isCurrent}
            onResponderRelease={(e) => {
              if (isCurrent && player.duration > 0) {
                seekTo((e.nativeEvent.locationX / seekWidth) * player.duration);
              }
            }}
            accessible
            accessibilityLabel="Seek bar"
          >
            <View style={[styles.seekTrack, { backgroundColor: theme.separator }]}>
              <View
                style={[styles.seekFill, { backgroundColor: theme.accent, width: `${progress * 100}%` }]}
              />
            </View>
          </View>

          <View style={styles.underSeekRow}>
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {isCurrent ? formatTime(player.currentTime) : '0:00'}
            </Text>
            <View style={styles.playbackOptions}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  cycleRate();
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Playback speed ${player.rate}x`}
                style={[styles.ratePill, { backgroundColor: theme.surfaceAlt }]}
              >
                <Text style={[styles.rateText, { color: theme.text }]}>{player.rate}×</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  toggleLoop();
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityState={{ selected: player.loop }}
                accessibilityLabel="Repeat story"
                style={[
                  styles.ratePill,
                  { backgroundColor: player.loop ? theme.accent : theme.surfaceAlt },
                ]}
              >
                <RepeatIcon size={16} color={player.loop ? theme.textOnAccent : theme.text} />
              </Pressable>
            </View>
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {isCurrent && player.duration > 0 ? formatTime(player.duration) : '--:--'}
            </Text>
          </View>

          {/* Download state row */}
          {download.phase === 'downloading' || download.phase === 'queued' ? (
            <View style={[styles.downloadRow, { borderTopColor: theme.separator }]}>
              <View style={[styles.dlTrack, { backgroundColor: theme.separator }]}>
                <View
                  style={[
                    styles.dlFill,
                    { backgroundColor: theme.accent, width: `${download.progress * 100}%` },
                  ]}
                />
              </View>
              <Text style={[styles.dlText, { color: theme.textSecondary }]}>
                {download.phase === 'queued' ? 'Waiting…' : `Downloading ${Math.round(download.progress * 100)}%`}
              </Text>
            </View>
          ) : download.phase === 'done' && !stale ? (
            <View style={[styles.downloadRow, { borderTopColor: theme.separator }]}>
              <CheckCircleIcon size={18} color={theme.success} />
              <Text style={[styles.dlText, { color: theme.textSecondary, flex: 1 }]}>
                Available offline
              </Text>
              <Pressable onPress={confirmDelete} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove download">
                <TrashIcon size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={onDownloadPress}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.downloadRow,
                { borderTopColor: theme.separator, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <DownloadIcon size={18} color={theme.accent} />
              <Text style={[styles.dlText, { color: theme.accent, fontWeight: '600' }]}>
                {stale
                  ? 'Update audio (new version available)'
                  : `Download for offline (${formatBytes(story.audio.bytes)})`}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {story.paragraphs.length > 0 ? (
        <View style={styles.textWrap}>
          {story.paragraphs.map((paragraph, i) => (
            <Text key={i} style={[styles.paragraph, { color: theme.text }]}>
              {paragraph}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={[styles.noText, { color: theme.textSecondary }]}>
          This story is told in the audio recording{story.doc ? ' and the document below' : ''}.
        </Text>
      )}

      {story.doc && (
        <Pressable
          onPress={() => Linking.openURL(story.doc!.url)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.docRow,
            { backgroundColor: theme.surface, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <DocIcon size={20} color={theme.text} />
          <Text style={[styles.docText, { color: theme.text }]}>
            Open printable document ({story.doc.kind.toUpperCase()}, {formatBytes(story.doc.bytes)})
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  artWrap: { borderRadius: radius.card, overflow: 'hidden', aspectRatio: 3 / 2 },
  art: { width: '100%', height: '100%' },
  title: { fontSize: 24, fontWeight: '700', marginTop: 18, lineHeight: 30 },
  ref: { fontSize: 15, marginTop: 4 },
  chips: { marginTop: 14 },
  playerCard: {
    borderRadius: radius.card,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  sideBtn: { padding: 6 },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekWrap: { paddingVertical: 12, marginTop: 4 },
  seekTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  seekFill: { height: '100%' },
  underSeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  playbackOptions: { flexDirection: 'row', gap: 10 },
  time: { fontSize: 13, fontVariant: ['tabular-nums'], minWidth: 44 },
  ratePill: {
    minWidth: 44,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  rateText: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
  },
  dlTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  dlFill: { height: '100%' },
  dlText: { fontSize: 14 },
  textWrap: { marginTop: 24, gap: 16 },
  paragraph: { fontFamily: storyFont, fontSize: 18, lineHeight: 30 },
  noText: { marginTop: 24, fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 24,
  },
  docText: { fontSize: 15, flex: 1 },
});
