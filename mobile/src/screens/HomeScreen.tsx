import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { tripsApi } from '../services/api';
import { Trip } from '../types';

const DESTINATION_EMOJI: Record<string, string> = {
  서울: '🏯',
  부산: '🌊',
  도쿄: '🗼',
};

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tripsApi.list();
      setTrips(data);
    } catch {
      // 홈 화면에서는 조용히 실패한다. 사용자가 새로고침으로 재시도할 수 있다.
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.title}>내 여행 지도</Text>
        <Text style={[typography.caption, styles.subtitle]}>나만의 여행 가이드북을 만들어보세요.</Text>
      </View>

      <View style={styles.actions}>
        <AppButton label="＋ 새 지도 만들기" onPress={() => navigation.navigate('NewTripFlow')} />
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTrips} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.caption, styles.empty]}>
              아직 만든 여행 지도가 없어요. 새 지도를 만들어보세요.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.tripCard}>
            <Text style={styles.tripEmoji}>{DESTINATION_EMOJI[item.destination] ?? '🗺️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={typography.subheading}>{item.title}</Text>
              <Text style={typography.caption}>
                {item.destination} · {new Date(item.startDate).toLocaleDateString()} ~{' '}
                {new Date(item.endDate).toLocaleDateString()}
              </Text>
            </View>
            <AppButton
              label={item.selectedRouteId ? '가이드북 보기' : '루트 비교'}
              variant="secondary"
              onPress={() =>
                item.selectedRouteId
                  ? navigation.navigate('TripGuidebook', { tripId: item.id })
                  : navigation.navigate('RouteCompare', { tripId: item.id })
              }
            />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { marginBottom: spacing.md },
  subtitle: { marginTop: spacing.xs },
  actions: { marginBottom: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  tripCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  tripEmoji: { fontSize: 28 },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
