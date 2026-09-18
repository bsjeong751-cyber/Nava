import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { tripsApi } from '../services/api';
import { Trip } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RouteCompare'>;

const ROUTE_TYPE_LABEL: Record<string, string> = {
  BUDGET: '가성비',
  OPTIMIZED: '동선 최적화',
  LOCAL: '현지 감성',
};

function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${meters}m`;
}

export function RouteCompareScreen({ route, navigation }: Props) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripsApi
      .getOne(tripId)
      .then(setTrip)
      .catch((e) => setError(e instanceof Error ? e.message : '루트를 불러오지 못했어요.'));
  }, [tripId]);

  const handleSelect = async (routeId: string) => {
    setSelecting(routeId);
    setError(null);
    try {
      await tripsApi.selectRoute(tripId, routeId);
      navigation.replace('TripGuidebook', { tripId });
    } catch (e) {
      setError(e instanceof Error ? e.message : '루트를 선택하지 못했어요.');
    } finally {
      setSelecting(null);
    }
  };

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={typography.caption}>{error ?? '루트를 불러오는 중이에요...'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.title}>{trip.destination} 루트 비교</Text>
      <Text style={[typography.caption, styles.subtitle]}>
        세 가지 스타일로 초안을 준비했어요. 마음에 드는 루트를 고른 뒤 자유롭게 수정할 수 있어요.
      </Text>

      {trip.routes.map((r) => (
        <Card key={r.id} style={styles.routeCard}>
          <View style={styles.routeBadge}>
            <Text style={styles.routeBadgeText}>{ROUTE_TYPE_LABEL[r.type] ?? r.type}</Text>
          </View>
          <Text style={typography.heading}>{r.name}</Text>
          <Text style={[typography.body, styles.reasoning]}>{r.reasoningSummary}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={typography.small}>예상 비용</Text>
              <Text style={typography.subheading}>
                {r.estimatedBudgetMin.toLocaleString()} ~ {r.estimatedBudgetMax.toLocaleString()}원
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={typography.small}>총 소요시간</Text>
              <Text style={typography.subheading}>{formatMinutes(r.totalDurationMinutes)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={typography.small}>이동거리</Text>
              <Text style={typography.subheading}>{formatDistance(r.totalDistanceMeters)}</Text>
            </View>
          </View>

          <Text style={[typography.caption, styles.placeCount]}>방문 장소 {r.places.filter((p) => p.slotType === 'PLACE').length}곳</Text>

          <AppButton label="이 루트 선택하기" onPress={() => handleSelect(r.id)} loading={selecting === r.id} />
        </Card>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  subtitle: { marginBottom: spacing.sm },
  routeCard: { gap: spacing.sm },
  routeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  routeBadgeText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  reasoning: { color: colors.textSecondary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  statItem: { gap: 2 },
  placeCount: { marginTop: -spacing.xs },
  error: { color: colors.danger, fontSize: 13 },
});
