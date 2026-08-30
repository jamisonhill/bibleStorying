// Settings: data protection (Wi-Fi only), storage management, and manual
// content updates. Deliberately small — the app should mostly disappear
// behind the stories.

import { useState, useSyncExternalStore } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getMeta, getMetaNumber, setMeta } from '@/lib/db';
import {
  deleteAllAudio, downloadsVersion, subscribeDownloads, totalDownloadedBytes,
} from '@/lib/downloads';
import { formatBytes } from '@/lib/format';
import { checkForUpdates } from '@/lib/updater';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  useSyncExternalStore(subscribeDownloads, downloadsVersion);

  const [wifiOnly, setWifiOnly] = useState(getMeta('wifiOnly') !== 'false');
  const [checking, setChecking] = useState(false);
  const [updateNote, setUpdateNote] = useState<string | null>(null);

  const storedBytes = totalDownloadedBytes();
  const contentVersion = getMetaNumber('contentVersion') ?? 1;

  const toggleWifiOnly = (value: boolean) => {
    setWifiOnly(value);
    setMeta('wifiOnly', String(value));
  };

  const runUpdateCheck = async () => {
    setChecking(true);
    setUpdateNote(null);
    const result = await checkForUpdates();
    setChecking(false);
    switch (result.status) {
      case 'updated':
        setUpdateNote('Stories updated to the latest from the website.');
        break;
      case 'up-to-date':
        setUpdateNote('Already up to date.');
        break;
      case 'offline':
        setUpdateNote('You are offline — stories will update automatically when connected.');
        break;
      default:
        setUpdateNote('Could not check right now. Your stories still work offline.');
    }
  };

  const confirmDeleteAll = () => {
    Alert.alert(
      'Remove all downloaded audio?',
      `This frees ${formatBytes(storedBytes)}. Story text and pictures always stay on your phone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove all', style: 'destructive', onPress: deleteAllAudio },
      ],
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
    >
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>MOBILE DATA</Text>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>Download on Wi-Fi only</Text>
            <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
              Protects your mobile data bundle. Audio downloads wait for Wi-Fi.
            </Text>
          </View>
          <Switch
            value={wifiOnly}
            onValueChange={toggleWifiOnly}
            trackColor={{ true: theme.accent }}
            accessibilityLabel="Download on Wi-Fi only"
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>STORAGE</Text>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.separator }]}>
          <Text style={[styles.rowTitle, { color: theme.text, flex: 1 }]}>Downloaded audio</Text>
          <Text style={[styles.rowValue, { color: theme.textSecondary }]}>
            {formatBytes(storedBytes)}
          </Text>
        </View>
        <Pressable
          onPress={confirmDeleteAll}
          disabled={storedBytes === 0}
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.rowTitle, { color: storedBytes === 0 ? theme.textSecondary : theme.danger }]}>
            Remove all downloaded audio
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>CONTENT</Text>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Pressable
          onPress={runUpdateCheck}
          disabled={checking}
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.accent, fontWeight: '600' }]}>
              {checking ? 'Checking…' : 'Check for new stories'}
            </Text>
            <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
              New and updated stories from biblestoryingkenya.com arrive automatically about once a day when online.
            </Text>
            {updateNote && (
              <Text style={[styles.rowSub, { color: theme.text, marginTop: 6 }]}>{updateNote}</Text>
            )}
          </View>
        </Pressable>
      </View>

      <Text style={[styles.footer, { color: theme.textSecondary }]}>
        Content version {contentVersion} · Stories © Bible Storying Kenya{'\n'}
        biblestoryingkenya.com
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { borderRadius: radius.card },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowTitle: { fontSize: 16 },
  rowSub: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  rowValue: { fontSize: 16 },
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 32 },
});
