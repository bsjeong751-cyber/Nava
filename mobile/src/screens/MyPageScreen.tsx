import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';

export function MyPageScreen() {
  const { logout } = useAuth();
  const [nickname, setNickname] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    usersApi
      .me()
      .then((me: { nickname: string; email: string }) => {
        setNickname(me.nickname);
        setEmail(me.email);
      })
      .catch(() => undefined);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={typography.title}>마이페이지</Text>
      <Card style={styles.card}>
        <Text style={typography.subheading}>{nickname ?? '...'}</Text>
        <Text style={typography.caption}>{email ?? ''}</Text>
      </Card>
      <AppButton label="로그아웃" variant="secondary" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  card: { gap: spacing.xs },
});
