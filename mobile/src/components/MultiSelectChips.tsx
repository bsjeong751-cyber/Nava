import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';

interface Props {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}

export function MultiSelectChips({ options, selected, onToggle }: Props) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const isActive = selected.includes(option);
        return (
          <Pressable
            key={option}
            onPress={() => onToggle(option)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { color: colors.textPrimary, fontSize: 14 },
  labelActive: { color: colors.white, fontWeight: '600' },
});
