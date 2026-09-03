// Persistent mini-player bar: appears above the bottom edge whenever audio
// is loaded, so a story keeps playing while browsing and is always one tap
// away. Tapping the bar returns to the story; the X stops playback.

import { useRouter, useSegments } from 'expo-router';
import { useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT } from '@/constants/layout';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  playerState, stopPlayback, subscribePlayer, togglePlayback,
} from '@/lib/player';
import { PauseIcon, PlayIcon, XIcon } from './icons';

export function MiniPlayer() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const state = useSyncExternalStore(subscribePlayer, playerState);

  // This bar is rendered outside the tab navigator so it survives screens
  // pushed above the tabs (a story, a video). On those it sits at the bottom
  // edge; on a tab screen it has to clear the tab bar as well. Asking React
  // Navigation is not an option from out here, so the height comes from the
  // shared constant the tab bar itself is pinned to.
  const onTabScreen = segments[0] === '(tabs)';
  const bottom = insets.bottom + 12 + (onTabScreen ? TAB_BAR_HEIGHT : 0);

  if (!state.storyId) return null;

  const progress = state.duration > 0 ? state.currentTime / state.duration : 0;

  return (
    <View
      style={[
        styles.wrap,
        { bottom },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => router.push(`/story/${state.storyId}`)}
        accessibilityRole="button"
        accessibilityLabel={`Now playing: ${state.title}. Open story.`}
        style={[styles.bar, { backgroundColor: theme.surface, shadowColor: '#000' }]}
      >
        <Pressable
          onPress={togglePlayback}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={state.playing ? 'Pause' : 'Play'}
          style={[styles.playBtn, { backgroundColor: theme.accent }]}
        >
          {state.playing ? (
            <PauseIcon size={18} color={theme.textOnAccent} />
          ) : (
            <PlayIcon size={18} color={theme.textOnAccent} />
          )}
        </Pressable>
        <View style={styles.middle}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {state.title}
          </Text>
          <View style={[styles.track, { backgroundColor: theme.separator }]}>
            <View
              style={[
                styles.trackFill,
                { backgroundColor: theme.accent, width: `${progress * 100}%` },
              ]}
            />
          </View>
        </View>
        <Pressable
          onPress={stopPlayback}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Stop playback"
          style={styles.closeBtn}
        >
          <XIcon size={16} color={theme.textSecondary} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: { flex: 1, gap: 6 },
  title: { fontSize: 14, fontWeight: '600' },
  track: { height: 3, borderRadius: 2, overflow: 'hidden' },
  trackFill: { height: '100%' },
  closeBtn: { padding: 6 },
});
