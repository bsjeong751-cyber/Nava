import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppButton } from '../components/AppButton';
import { StepHeader } from '../components/StepHeader';
import { MultiSelectChips } from '../components/MultiSelectChips';
import { tripsApi } from '../services/api';
import { Budget, Mobility, TravelPace, TripDraft } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewTripFlow'>;

const DESTINATIONS = ['서울', '부산', '도쿄'];
const INTEREST_OPTIONS = ['맛집', '카페', '쇼핑', '자연', '역사', '문화', '야경', '로컬감성', '관광명소', '조용한장소', '액티비티'];
const BUDGET_OPTIONS: { key: Budget; label: string }[] = [
  { key: 'VERY_LOW', label: '초저예산' },
  { key: 'LOW', label: '가성비' },
  { key: 'NORMAL', label: '보통' },
  { key: 'COMFORTABLE', label: '여유롭게' },
  { key: 'LUXURY', label: '고급' },
];
const PACE_OPTIONS: { key: TravelPace; label: string; hint: string }[] = [
  { key: 'RELAXED', label: '여유롭게', hint: '하루 2곳 정도' },
  { key: 'NORMAL', label: '보통', hint: '하루 3곳 정도' },
  { key: 'ACTIVE', label: '많이 걷기', hint: '하루 4곳 정도' },
  { key: 'INTENSE', label: '최대한 많이 보기', hint: '하루 5곳 정도' },
];
const MOBILITY_OPTIONS: { key: Mobility; label: string }[] = [
  { key: 'WALK', label: '도보' },
  { key: 'PUBLIC_TRANSIT', label: '대중교통' },
  { key: 'SUBWAY', label: '지하철' },
  { key: 'BUS', label: '버스' },
  { key: 'TAXI', label: '택시' },
  { key: 'CAR', label: '자동차' },
  { key: 'BICYCLE', label: '자전거' },
];

const TOTAL_STEPS = 6;

export function NewTripFlowScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [mustVisitText, setMustVisitText] = useState('');
  const [budget, setBudget] = useState<Budget>('NORMAL');
  const [pace, setPace] = useState<TravelPace>('NORMAL');
  const [mobility, setMobility] = useState<Mobility[]>(['WALK']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFromList = <T,>(list: T[], value: T, setter: (v: T[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
        return destination.trim().length > 0;
      case 2:
        return /^\d{4}-\d{2}-\d{2}$/.test(startDate) && /^\d{4}-\d{2}-\d{2}$/.test(endDate);
      case 3:
        return interests.length > 0;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return mobility.length > 0;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    await handleSubmit();
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const draft: TripDraft = {
        destination,
        startDate,
        endDate,
        interests,
        mustVisit: mustVisitText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        budget,
        pace,
        mobility,
      };
      const trip = await tripsApi.create(draft);
      await tripsApi.generateRoutes(trip.id);
      navigation.replace('RouteCompare', { tripId: trip.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : '여행 루트를 만들지 못했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {step === 1 && (
        <>
          <StepHeader step={1} totalSteps={TOTAL_STEPS} title="어디로 떠나시나요?" subtitle="여행 지역을 선택해주세요." />
          <MultiSelectChips options={DESTINATIONS} selected={destination ? [destination] : []} onToggle={setDestination} />
          <TextInput
            style={styles.input}
            placeholder="다른 지역을 직접 입력해도 돼요"
            placeholderTextColor={colors.textMuted}
            value={destination}
            onChangeText={setDestination}
          />
        </>
      )}

      {step === 2 && (
        <>
          <StepHeader step={2} totalSteps={TOTAL_STEPS} title="여행 기간이 어떻게 되나요?" subtitle="YYYY-MM-DD 형식으로 입력해주세요." />
          <TextInput
            style={styles.input}
            placeholder="시작일 (예: 2026-10-01)"
            placeholderTextColor={colors.textMuted}
            value={startDate}
            onChangeText={setStartDate}
          />
          <TextInput
            style={styles.input}
            placeholder="종료일 (예: 2026-10-03)"
            placeholderTextColor={colors.textMuted}
            value={endDate}
            onChangeText={setEndDate}
          />
        </>
      )}

      {step === 3 && (
        <>
          <StepHeader step={3} totalSteps={TOTAL_STEPS} title="어떤 여행을 좋아하세요?" subtitle="원하는 만큼 골라주세요." />
          <MultiSelectChips
            options={INTEREST_OPTIONS}
            selected={interests}
            onToggle={(o) => toggleFromList(interests, o, setInterests)}
          />
        </>
      )}

      {step === 4 && (
        <>
          <StepHeader step={4} totalSteps={TOTAL_STEPS} title="꼭 가고 싶은 곳이 있나요?" subtitle="쉼표(,)로 구분해서 입력해주세요. 없으면 비워두어도 돼요." />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="예: 경복궁, 성수동 카페거리"
            placeholderTextColor={colors.textMuted}
            value={mustVisitText}
            onChangeText={setMustVisitText}
            multiline
          />
        </>
      )}

      {step === 5 && (
        <>
          <StepHeader step={5} totalSteps={TOTAL_STEPS} title="예산과 여행 강도는 어느 정도로 할까요?" />
          <Text style={[typography.subheading, styles.sectionLabel]}>예산</Text>
          <MultiSelectChips
            options={BUDGET_OPTIONS.map((b) => b.label)}
            selected={[BUDGET_OPTIONS.find((b) => b.key === budget)?.label ?? '']}
            onToggle={(label) => {
              const found = BUDGET_OPTIONS.find((b) => b.label === label);
              if (found) setBudget(found.key);
            }}
          />
          <Text style={[typography.subheading, styles.sectionLabel]}>여행 강도</Text>
          <MultiSelectChips
            options={PACE_OPTIONS.map((p) => p.label)}
            selected={[PACE_OPTIONS.find((p) => p.key === pace)?.label ?? '']}
            onToggle={(label) => {
              const found = PACE_OPTIONS.find((p) => p.label === label);
              if (found) setPace(found.key);
            }}
          />
          <Text style={typography.caption}>{PACE_OPTIONS.find((p) => p.key === pace)?.hint}</Text>
        </>
      )}

      {step === 6 && (
        <>
          <StepHeader step={6} totalSteps={TOTAL_STEPS} title="어떻게 이동하실 건가요?" subtitle="여러 개를 조합해서 선택할 수 있어요." />
          <MultiSelectChips
            options={MOBILITY_OPTIONS.map((m) => m.label)}
            selected={mobility.map((m) => MOBILITY_OPTIONS.find((o) => o.key === m)?.label ?? '')}
            onToggle={(label) => {
              const found = MOBILITY_OPTIONS.find((m) => m.label === label);
              if (found) toggleFromList(mobility, found.key, setMobility);
            }}
          />
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        {step > 1 && <AppButton label="이전" variant="secondary" onPress={() => setStep(step - 1)} disabled={submitting} />}
        <AppButton
          label={step === TOTAL_STEPS ? '루트 만들기' : '다음'}
          onPress={handleNext}
          disabled={!canGoNext()}
          loading={submitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  sectionLabel: { marginTop: spacing.sm },
  error: { color: colors.danger, fontSize: 13 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
});
