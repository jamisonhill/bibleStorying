// About CBS: the website's explanation of Chronological Bible Storying,
// bundled offline like everything else.

import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storyFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPage } from '@/lib/db';

export default function AboutScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const page = getPage('about-cbs');

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
    >
      {page?.paragraphs.map((paragraph, i) => (
        <Text key={i} style={[styles.paragraph, { color: theme.text }]}>
          {paragraph}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12, gap: 14 },
  paragraph: { fontFamily: storyFont, fontSize: 17, lineHeight: 27 },
});
