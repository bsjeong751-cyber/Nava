import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { Card } from '../components/Card';
import { communityApi } from '../services/api';
import { CommunityPost } from '../types';

export function CommunityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useFocusEffect(
    useCallback(() => {
      communityApi.list().then(setPosts).catch(() => undefined);
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={typography.title}>커뮤니티</Text>
      <Text style={[typography.caption, styles.subtitle]}>다른 여행자들의 여행 지도를 둘러보세요.</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('CommunityPostDetail', { postId: item.id })}>
            <Card style={styles.card}>
              <Text style={typography.subheading}>{item.title}</Text>
              <Text style={typography.caption}>
                {item.trip?.destination} · {item.author.nickname}
              </Text>
              <Text style={typography.small}>
                조회 {item.viewCount} · 저장 {item.saveCount}
              </Text>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={[typography.caption, styles.empty]}>아직 공유된 여행 지도가 없어요.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  subtitle: { marginBottom: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  card: { gap: spacing.xs, marginBottom: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
