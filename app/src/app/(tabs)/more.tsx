// More tab: the two screens that used to hang off the home screen — the
// "What is Chronological Bible Storying?" link in its footer and the gear
// icon in its header. Tabs give them a permanent home instead.

import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRightIcon, GearIcon, InfoCircleIcon } from '@/components/icons';
import { MINI_PLAYER_SPACE, TAB_BAR_HEIGHT } from '@/constants/layout';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getMetaNumber } from '@/lib/db';

export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const contentVersion = getMetaNumber('contentVersion') ?? 1;

  const rows: { key: string; title: string; subtitle: string; icon: React.ReactNode; to: Href }[] = [
    {
      key: 'about',
      title: 'About CBS',
      subtitle: 'What is Chronological Bible Storying?',
      icon: <InfoCircleIcon size={20} color={theme.textSecondary} />,
      to: '/about',
    },
    {
      key: 'settings',
      title: 'Settings',
      subtitle: 'Mobile data, storage, and content updates',
      icon: <GearIcon size={20} color={theme.textSecondary} />,
      to: '/settings',
    },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 24,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + MINI_PLAYER_SPACE,
        },
      ]}
    >
      <Text style={[styles.screenTitle, { color: theme.text }]}>More</Text>

      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        {rows.map((row, i) => (
          <Pressable
            key={row.key}
            onPress={() => router.push(row.to)}
            accessibilityRole="button"
            accessibilityLabel={row.title}
            style={({ pressed }) => [
              styles.row,
              i < rows.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.separator,
              },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            {row.icon}
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>{row.title}</Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{row.subtitle}</Text>
            </View>
            <ChevronRightIcon size={18} color={theme.textSecondary} />
          </Pressable>
        ))}
      </View>

      <Text style={[styles.footer, { color: theme.textSecondary }]}>
        Content version {contentVersion} · Stories © Bible Storying Kenya{'\n'}
        biblestoryingkenya.com
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5, marginBottom: 22 },
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
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 32 },
});
