import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { typography } from '../theme/typography';

interface Props {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

export function StepHeader({ step, totalSteps, title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
      </View>
      <Text style={styles.stepLabel}>{`STEP ${step} / ${totalSteps}`}</Text>
      <Text style={typography.heading}>{title}</Text>
      {subtitle ? <Text style={[typography.caption, styles.subtitle]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: radii.pill },
  stepLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: spacing.xs },
  subtitle: { marginTop: spacing.xs },
});
