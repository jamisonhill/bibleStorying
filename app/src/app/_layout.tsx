// Root layout: opens the database (importing bundled content on first
// launch), kicks off the daily content update check, and hosts the
// navigation stack, the floating mini-player, and the branded launch stage.
//
// The stack's first screen is the (tabs) group — Stories, Videos, More.
// Everything else (a collection, a story, a video) is pushed ABOVE the tabs,
// which is why the mini-player lives out here rather than inside the tab
// navigator: it has to survive both.

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { MiniPlayer } from '@/components/mini-player';
import { NATIVE_FADE_MS, SplashOverlay } from '@/components/splash-overlay';
import { Colors } from '@/constants/theme';
import { initDatabase } from '@/lib/db';
import { LanguageProvider } from '@/lib/language-context';
import { checkForUpdatesIfDue } from '@/lib/updater';

// Hold the native launch screen until SplashOverlay has painted its own,
// identically-coloured stage; without this the OS splash tears down on the
// first frame and shows a white flash underneath. SplashOverlay always mounts,
// so the matching hideAsync() cannot be missed.
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Racing an already-hidden splash is harmless — the app still launches.
});
// Dissolve rather than cut, so the launch icon and the wordmark cross on the
// same slate field instead of one snapping to the other.
SplashScreen.setOptions({ fade: true, duration: NATIVE_FADE_MS });

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Database must be ready before any screen queries it. initDatabase is
  // synchronous (SQLite + bundled seed), so this runs once, before render.
  const [ready] = useState(() => {
    initDatabase();
    return true;
  });

  // Quiet daily content check; failures are ignored (offline is normal).
  useEffect(() => {
    void checkForUpdatesIfDue();
  }, []);

  if (!ready) return null;

  return (
    <LanguageProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerTintColor: theme.accent,
          headerTitleStyle: { color: theme.text },
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="collection/[id]" options={{ title: '', headerBackTitle: 'Stories' }} />
        <Stack.Screen name="story/[...id]" options={{ title: '' }} />
        <Stack.Screen name="video/[id]" options={{ title: '', headerBackTitle: 'Videos' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings', headerBackTitle: 'More' }} />
        <Stack.Screen name="about" options={{ title: 'About CBS', headerBackTitle: 'More' }} />
      </Stack>
      <MiniPlayer />
      <SplashOverlay />
    </LanguageProvider>
  );
}
