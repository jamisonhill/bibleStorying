// A horizontal row of pill chips where exactly one is selected — the control
// behind the language picker and the Settings theme picker. Generic over the
// value type so callers keep their own string unions.

import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: ChipOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export function ChoiceChips<T extends string>({ options, selected, onSelect }: Props<T>) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(option.value);
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
              {option.label}
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
