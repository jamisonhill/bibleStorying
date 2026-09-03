// Stories tab: choose a language, then a collection. Collections are large
// image cards (image-first navigation for oral learners); the cover is the
// first story's cloth artwork in the chosen language.
//
// About and Settings used to hang off this screen's footer and header; they
// now live in the More tab, so this screen is only about picking a story.

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageChips } from '@/components/language-chips';
import { MINI_PLAYER_SPACE, TAB_BAR_HEIGHT } from '@/constants/layout';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCollections, getStoriesFor } from '@/lib/db';
import { imageSource } from '@/lib/images';
import { useLanguage } from '@/lib/language-context';
import type { CollectionId, LangCode } from '@/lib/types';

const COLLECTION_ORDER: CollectionId[] = ['cbs', 'sonship', 'acts'];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lang, setLang } = useLanguage();

  const collections = useMemo(() => getCollections(), []);

  // Languages that have at least one story anywhere in the app.
  const availableLangs = useMemo(() => {
    const langs = new Set<LangCode>();
    for (const c of collections) if (c.storyIds.length > 0) langs.add(c.lang);
    return (['en', 'sw', 'ma', 'br'] as LangCode[]).filter((l) => langs.has(l));
  }, [collections]);

  const cards = useMemo(
    () =>
      COLLECTION_ORDER.map((id) => {
        const inLang = collections.find((c) => c.id === id && c.lang === lang);
        const anyLang = collections.find((c) => c.id === id && c.storyIds.length > 0);
        const count = inLang?.storyIds.length ?? 0;
        // Cover image: first story of this collection in the chosen language
        // (or any language for collections not yet translated).
        const coverStories = count > 0 ? getStoriesFor(id, lang) : anyLang ? getStoriesFor(id, anyLang.lang) : [];
        const cover = coverStories.find((s) => s.imagePath)?.imagePath ?? null;
        return {
          id,
          title: inLang?.title ?? anyLang?.title ?? id,
          count,
          cover,
        };
      }).filter((c) => c.count > 0 || c.cover !== null),
    [collections, lang],
  );

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
      <Text style={[styles.appTitle, { color: theme.text }]}>Bible Storying{'\n'}Kenya</Text>
      <Text style={[styles.tagline, { color: theme.textSecondary }]}>
        Sharing God’s redemption story, one chronological step at a time.
      </Text>

      <View style={styles.chips}>
        <LanguageChips languages={availableLangs} selected={lang} onSelect={setLang} />
      </View>

      <View style={styles.cards}>
        {cards.map((card) => {
          const source = imageSource(card.cover);
          const disabled = card.count === 0;
          return (
            <Pressable
              key={card.id}
              disabled={disabled}
              onPress={() => router.push(`/collection/${card.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${card.title}, ${card.count} stories`}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.surface, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={[styles.cardArtWrap, { backgroundColor: theme.surfaceAlt }]}>
                {source && (
                  <Image source={source} style={styles.cardArt} contentFit="cover" transition={150} />
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{card.title}</Text>
                <Text style={[styles.cardCount, { color: theme.textSecondary }]}>
                  {disabled
                    ? 'Not yet available in this language'
                    : `${card.count} ${card.count === 1 ? 'story' : 'stories'}`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  appTitle: { fontSize: 32, fontWeight: '700', lineHeight: 38, letterSpacing: -0.5 },
  tagline: { fontSize: 15, lineHeight: 21, marginTop: 10 },
  chips: { marginTop: 20 },
  cards: { marginTop: 24, gap: 16 },
  card: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  cardArtWrap: { aspectRatio: 21 / 9 },
  cardArt: { width: '100%', height: '100%' },
  cardBody: { paddingHorizontal: 16, paddingVertical: 14 },
  cardTitle: { fontSize: 19, fontWeight: '700' },
  cardCount: { fontSize: 13, marginTop: 3 },
});
