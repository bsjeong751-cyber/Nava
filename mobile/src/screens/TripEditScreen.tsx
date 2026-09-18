import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { placesApi, tripsApi } from '../services/api';
import { Place, Trip } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TripEdit'>;

interface EditablePlace {
  placeId: string;
  name: string;
}

export function TripEditScreen({ route, navigation }: Props) {
  const { tripId, routeId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [dayPlaces, setDayPlaces] = useState<Record<number, EditablePlace[]>>({});
  const [searchOpenForDay, setSearchOpenForDay] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripsApi.getOne(tripId).then((t) => {
      setTrip(t);
      const selected = t.routes.find((r) => r.id === routeId);
      if (!selected) return;
      const grouped: Record<number, EditablePlace[]> = {};
      t.days.forEach((d) => (grouped[d.dayNumber] = []));
      selected.places
        .filter((p) => p.slotType === 'PLACE' && p.place)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .forEach((p) => {
          grouped[p.dayNumber] = grouped[p.dayNumber] ?? [];
          grouped[p.dayNumber].push({ placeId: p.place!.id, name: p.place!.name });
        });
      setDayPlaces(grouped);
    });
  }, [tripId, routeId]);

  const dayNumbers = useMemo(() => Object.keys(dayPlaces).map(Number).sort((a, b) => a - b), [dayPlaces]);

  const moveItem = (day: number, index: number, direction: -1 | 1) => {
    setDayPlaces((prev) => {
      const list = [...(prev[day] ?? [])];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, [day]: list };
    });
  };

  const removeItem = (day: number, index: number) => {
    setDayPlaces((prev) => {
      const list = [...(prev[day] ?? [])];
      list.splice(index, 1);
      return { ...prev, [day]: list };
    });
  };

  const runSearch = async () => {
    if (!trip) return;
    const results = await placesApi.search(trip.destination, query || undefined);
    setSearchResults(results);
  };

  const addPlace = (day: number, place: Place) => {
    setDayPlaces((prev) => ({ ...prev, [day]: [...(prev[day] ?? []), { placeId: place.id, name: place.name }] }));
    setSearchOpenForDay(null);
    setQuery('');
    setSearchResults([]);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = dayNumbers.flatMap((day) => dayPlaces[day].map((p) => ({ placeId: p.placeId, dayNumber: day })));
      await tripsApi.updateRoutePlaces(tripId, routeId, payload);
      navigation.replace('TripGuidebook', { tripId });
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  };

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={typography.caption}>불러오는 중이에요...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.title}>루트 편집</Text>
      <Text style={[typography.caption, styles.subtitle]}>
        장소를 추가/삭제하거나 순서를 바꾸면 시간과 이동시간이 자동으로 다시 계산돼요.
      </Text>

      {dayNumbers.map((day) => (
        <View key={day} style={styles.daySection}>
          <Text style={typography.heading}>DAY {day}</Text>
          {(dayPlaces[day] ?? []).map((p, index) => (
            <Card key={`${p.placeId}-${index}`} style={styles.placeRow}>
              <Text style={{ flex: 1 }}>{p.name}</Text>
              <AppButton label="▲" variant="ghost" onPress={() => moveItem(day, index, -1)} />
              <AppButton label="▼" variant="ghost" onPress={() => moveItem(day, index, 1)} />
              <AppButton label="삭제" variant="ghost" onPress={() => removeItem(day, index)} />
            </Card>
          ))}

          {searchOpenForDay === day ? (
            <View style={styles.searchBox}>
              <TextInput
                style={styles.input}
                placeholder="장소명, 취향 키워드로 검색"
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={runSearch}
              />
              <AppButton label="검색" variant="secondary" onPress={runSearch} />
              {searchResults.map((r) => (
                <Card key={r.id} style={styles.resultRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={typography.subheading}>{r.name}</Text>
                    <Text style={typography.caption}>{r.category}</Text>
                  </View>
                  <AppButton label="추가" onPress={() => addPlace(day, r)} />
                </Card>
              ))}
              <AppButton label="닫기" variant="ghost" onPress={() => setSearchOpenForDay(null)} />
            </View>
          ) : (
            <AppButton label="＋ 장소 추가" variant="secondary" onPress={() => setSearchOpenForDay(day)} />
          )}
        </View>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton label="저장하고 가이드북으로" onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  subtitle: { marginBottom: spacing.sm },
  daySection: { gap: spacing.sm },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  searchBox: { gap: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  error: { color: colors.danger, fontSize: 13 },
});
