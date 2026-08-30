// Horizontal language selector chips. Only languages that actually have
// content are shown (Sonship has no Maasai/Borana stories yet, for example).

import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LANGUAGE_NAMES, type LangCode } from '@/lib/types';

interface Props {
  languages: LangCode[];
  selected: LangCode;
  onSelect: (lang: LangCode) => void;
}

export function LanguageChips({ languages, selected, onSelect }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {languages.map((lang) => {
        const active = lang === selected;
        return (
          <Pressable
            key={lang}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={LANGUAGE_NAMES[lang]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(lang);
            }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? theme.accent : theme.surfaceAlt,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? theme.textOnAccent : theme.text },
                active && styles.labelActive,
              ]}
            >
              {LANGUAGE_NAMES[lang]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    // 44pt minimum touch target via vertical padding
    paddingVertical: 10,
  },
  label: { fontSize: 15 },
  labelActive: { fontWeight: '600' },
});
