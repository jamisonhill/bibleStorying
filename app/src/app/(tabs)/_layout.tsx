// Bottom tabs — the app's top-level navigation.
//
// Stories keeps the original home screen (language chips + collection cards).
// Videos is the teaching-film library. More holds About and Settings, which
// previously hung off the home screen's header and its footer link.

import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookIcon, EllipsisIcon, VideoIcon } from '@/components/icons';
import { TAB_BAR_HEIGHT } from '@/constants/layout';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.separator,
          // Pinned so the mini-player can offset itself by exactly this much.
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color }) => <BookIcon size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Videos',
          tabBarIcon: ({ color }) => <VideoIcon size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <EllipsisIcon size={24} color={color as string} />,
        }}
      />
    </Tabs>
  );
}
