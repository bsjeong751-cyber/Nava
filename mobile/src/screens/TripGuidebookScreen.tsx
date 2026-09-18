import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { tripsApi } from '../services/api';
import { Trip } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TripGuidebook'>;

const SLOT_ICON: Record<string, string> = { PLACE: '📍', REST: '☕', MEAL: '🍽️' };

export function TripGuidebookScreen({ route, navigation }: Props) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    tripsApi
      .getOne(tripId)
      .then(setTrip)
      .catch((e) => setError(e instanceof Error ? e.message : '가이드북을 불러오지 못했어요.'));
  };

  useEffect(load, [tripId]);

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={typography.caption}>{error ?? '가이드북을 불러오는 중이에요...'}</Text>
      </View>
    );
  }

  const selectedRoute = trip.routes.find((r) => r.id === trip.selectedRouteId);
  if (!selectedRoute) {
    return (
      <View style={styles.center}>
        <Text style={typography.caption}>아직 선택된 루트가 없어요.</Text>
        <AppButton label="루트 비교로 이동" onPress={() => navigation.replace('RouteCompare', { tripId })} />
      </View>
    );
  }

  const days = trip.days.map((day) => ({
    ...day,
    places: selectedRoute.places
      .filter((p) => p.dayNumber === day.dayNumber)
      .sort((a, b) => a.orderIndex - b.orderIndex),
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.small}>MY GUIDEBOOK</Text>
      <Text style={typography.title}>{trip.title}</Text>
      <Text style={[typography.caption, styles.subtitle]}>
        {trip.destination} · {trip.days.length}일 · 예상 비용 {selectedRoute.estimatedBudgetMin.toLocaleString()}~
        {selectedRoute.estimatedBudgetMax.toLocaleString()}원
      </Text>

      {days.map((day) => (
        <View key={day.id} style={styles.daySection}>
          <View style={styles.dayHeaderRow}>
            <Text style={typography.heading}>DAY {day.dayNumber}</Text>
            <AppButton
              label="이 날 편집"
              variant="ghost"
              onPress={() => navigation.navigate('TripEdit', { tripId, routeId: selectedRoute.id })}
            />
          </View>
          {day.places.map((p) => (
            <Card key={p.id} style={styles.placeCard}>
              <Text style={styles.time}>{p.arrivalTime}</Text>
              <View style={{ flex: 1 }}>
                <Text style={typography.subheading}>
                  {SLOT_ICON[p.slotType]} {p.place?.name ?? p.note ?? '일정'}
                </Text>
                {p.place?.address ? <Text style={typography.caption}>{p.place.address}</Text> : null}
                <Text style={typography.small}>
                  체류 {p.stayMinutes}분{p.travelMinutes > 0 ? ` · 이동 ${p.travelMinutes}분` : ''}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      ))}

      <AppButton
        label="루트 직접 편집하기"
        variant="secondary"
        onPress={() => navigation.navigate('TripEdit', { tripId, routeId: selectedRoute.id })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: colors.background },
  subtitle: { marginBottom: spacing.md },
  daySection: { marginTop: spacing.md, gap: spacing.sm },
  dayHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placeCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  time: { width: 48, fontVariant: ['tabular-nums'], color: colors.accent, fontWeight: '700' },
});
