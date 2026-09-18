import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppButton } from '../components/AppButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>노바리아</Text>
        <Text style={[typography.body, styles.description]}>
          여행을 계획하는 것이 아니라,{'\n'}나만의 여행을 기록하세요.
        </Text>
        <Text style={[typography.caption, styles.subDescription]}>
          실시간 동선 최적화 엔진이 초안 80%를 만들고,{'\n'}나머지 20%는 당신이 직접 완성해요.
        </Text>
      </View>
      <View style={styles.actions}>
        <AppButton label="시작하기" onPress={() => navigation.navigate('Signup')} />
        <AppButton label="이미 계정이 있어요" variant="ghost" onPress={() => navigation.navigate('Login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between', padding: spacing.lg },
  hero: { flex: 1, justifyContent: 'center', gap: spacing.md },
  logo: { fontSize: 40, fontWeight: '800', color: colors.textPrimary },
  description: { fontSize: 18, fontWeight: '600' },
  subDescription: { lineHeight: 20 },
  actions: { gap: spacing.sm, paddingBottom: spacing.lg },
});
