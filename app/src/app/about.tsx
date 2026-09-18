// About CBS: the website's explanation of Chronological Bible Storying,
// bundled offline like everything else. Links inside the text ("View More",
// "Donate", "Contact Us") open the website in an in-app browser sheet.

import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storyFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPage } from '@/lib/db';
import { openInAppBrowser } from '@/lib/open-link';
import type { PageLink } from '@/lib/types';

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
        <LinkedParagraph
          key={i}
          text={paragraph}
          links={page.links.filter((l) => l.paragraph === i)}
          color={theme.text}
          linkColor={theme.accent}
        />
      ))}
    </ScrollView>
  );
}

/** One paragraph, with each link's anchor text rendered as a tappable run. */
function LinkedParagraph({
  text, links, color, linkColor,
}: { text: string; links: PageLink[]; color: string; linkColor: string }) {
  // Walk the paragraph left to right, cutting it into plain runs and link
  // runs. `cursor` moves past each match so a repeated anchor text (two
  // "Donate" links, say) attaches to successive occurrences, not the first.
  const runs: { text: string; href?: string }[] = [];
  let cursor = 0;
  for (const link of links) {
    const at = text.indexOf(link.text, cursor);
    if (at < 0) continue; // text and links drifted apart — show plain text rather than nothing
    if (at > cursor) runs.push({ text: text.slice(cursor, at) });
    runs.push({ text: link.text, href: link.href });
    cursor = at + link.text.length;
  }
  if (cursor < text.length) runs.push({ text: text.slice(cursor) });

  return (
    <Text style={[styles.paragraph, { color }]}>
      {runs.map((run, i) =>
        run.href ? (
          <Text
            key={i}
            accessibilityRole="link"
            onPress={() => void openInAppBrowser(run.href!)}
            style={{ color: linkColor, textDecorationLine: 'underline' }}
          >
            {run.text}
          </Text>
        ) : (
          <Text key={i}>{run.text}</Text>
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12, gap: 14 },
  paragraph: { fontFamily: storyFont, fontSize: 17, lineHeight: 27 },
});
