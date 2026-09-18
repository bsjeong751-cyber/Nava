import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { communityApi } from '../services/api';
import { RoutePlace, Trip } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CommunityPostDetail'>;

interface PostDetail {
  id: string;
  title: string;
  description?: string | null;
  author: { nickname: string };
  trip: Trip;
}

const SLOT_ICON: Record<string, string> = { PLACE: '📍', REST: '☕', MEAL: '🍽️' };

export function CommunityPostDetailScreen({ route, navigation }: Props) {
  const { postId } = route.params;
  const [post, setPost] = useState<PostDetail | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    communityApi
      .getOne(postId)
      .then((data) => setPost(data as unknown as PostDetail))
      .catch((e) => setError(e instanceof Error ? e.message : '게시물을 불러오지 못했어요.'));
  }, [postId]);

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    try {
      const newTrip = await communityApi.import(postId);
      navigation.replace('TripGuidebook', { tripId: newTrip.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : '내 지도로 가져오지 못했어요.');
    } finally {
      setImporting(false);
    }
  };

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={typography.caption}>{error ?? '불러오는 중이에요...'}</Text>
      </View>
    );
  }

  const selectedRoute = post.trip.routes.find((r) => r.id === post.trip.selectedRouteId) ?? post.trip.routes[0];
  const placesByDay: Record<number, RoutePlace[]> = {};
  selectedRoute?.places.forEach((p) => {
    placesByDay[p.dayNumber] = placesByDay[p.dayNumber] ?? [];
    placesByDay[p.dayNumber].push(p);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.title}>{post.title}</Text>
      <Text style={typography.caption}>
        {post.author.nickname} · {post.trip.destination}
      </Text>
      {post.description ? <Text style={typography.body}>{post.description}</Text> : null}

      {Object.entries(placesByDay).map(([day, places]) => (
        <View key={day} style={styles.daySection}>
          <Text style={typography.heading}>DAY {day}</Text>
          {places
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((p) => (
              <Card key={p.id} style={styles.placeRow}>
                <Text style={styles.time}>{p.arrivalTime}</Text>
                <Text style={{ flex: 1 }}>
                  {SLOT_ICON[p.slotType]} {p.place?.name ?? p.note ?? '일정'}
                </Text>
              </Card>
            ))}
        </View>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton label="내 지도에 가져오기" onPress={handleImport} loading={importing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  daySection: { marginTop: spacing.md, gap: spacing.sm },
  placeRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  time: { width: 48, color: colors.accent, fontWeight: '700' },
  error: { color: colors.danger, fontSize: 13 },
});
