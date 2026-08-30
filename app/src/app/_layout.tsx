// Root layout: opens the database (importing bundled content on first
// launch), kicks off the daily content update check, and hosts the
// navigation stack plus the floating mini-player.

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { MiniPlayer } from '@/components/mini-player';
import { Colors } from '@/constants/theme';
import { initDatabase } from '@/lib/db';
import { LanguageProvider } from '@/lib/language-context';
import { checkForUpdatesIfDue } from '@/lib/updater';

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
        <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
        <Stack.Screen name="collection/[id]" options={{ title: '' }} />
        <Stack.Screen name="story/[...id]" options={{ title: '' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="about" options={{ title: 'About CBS' }} />
      </Stack>
      <MiniPlayer />
    </LanguageProvider>
  );
}
