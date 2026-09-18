import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/colors';

// 복잡한 설명 없이 감성적인 여행 일기장 느낌의 첫 화면 (기획서 10항).
export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>노바리아</Text>
      <Text style={styles.tagline}>당신의 여행을 하나의 가이드북으로</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logo: { fontSize: 34, fontWeight: '800', color: colors.textPrimary, letterSpacing: 1 },
  tagline: { fontSize: 14, color: colors.textSecondary },
});
