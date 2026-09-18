import { Injectable } from '@nestjs/common';
import { PlaceCandidate } from '../places/place-provider.interface';
import { estimateTravelMinutes, haversineMeters } from './geo.util';
import { RecommendationInput, RouteDraft, RoutePlaceDraft, RouteTypeKey } from './recommendation.types';

// 규칙 기반 추천 엔진 (기획서 58항: LLM과 알고리즘을 분리한다).
// LLM은 자연어 이해/설명 생성을 담당하고, 거리·시간·예산 계산은 이 엔진이 담당한다.
// 현재는 MOCK 장소 데이터 위에서 동작하며, 실제 지도 API/LLM이 연동되면
// candidates 소스와 reasoningSummary 생성 부분만 교체하면 된다.

const PLACES_PER_DAY_BY_PACE: Record<string, number> = {
  RELAXED: 2,
  NORMAL: 3,
  ACTIVE: 4,
  INTENSE: 5,
};

// 예산 등급별 1일 예상 비용 범위 (원). 실제 물가 데이터 연동 전까지의 근사치.
const DAILY_BUDGET_RANGE: Record<string, [number, number]> = {
  VERY_LOW: [20000, 40000],
  LOW: [40000, 65000],
  NORMAL: [65000, 100000],
  COMFORTABLE: [100000, 160000],
  LUXURY: [160000, 300000],
  CUSTOM: [0, 0],
};

const START_MINUTES = 9 * 60; // 09:00
const LUNCH_WINDOW: [number, number] = [12 * 60, 13 * 60 + 30];
const DINNER_WINDOW: [number, number] = [18 * 60, 19 * 60 + 30];
const REST_AFTER_MINUTES = 180; // 3시간 활동 후 휴식 제안

function minutesToTimeStr(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function scoreByInterest(place: PlaceCandidate, interests: string[], mustVisit: string[]): number {
  const isMustVisit = mustVisit.some((name) => place.name.includes(name) || name.includes(place.name));
  const tagMatches = place.tags.filter((tag) => interests.includes(tag)).length;
  return (isMustVisit ? 1000 : 0) + tagMatches * 10 + (place.rating ?? 0);
}

function sortForBudgetRoute(places: PlaceCandidate[], interests: string[], mustVisit: string[]): PlaceCandidate[] {
  return [...places].sort((a, b) => {
    const priceDiff = (a.priceLevel ?? 2) - (b.priceLevel ?? 2);
    if (priceDiff !== 0) return priceDiff;
    return scoreByInterest(b, interests, mustVisit) - scoreByInterest(a, interests, mustVisit);
  });
}

function sortForLocalRoute(places: PlaceCandidate[], interests: string[], mustVisit: string[]): PlaceCandidate[] {
  const localTags = new Set(['로컬감성', '조용한장소']);
  return [...places].sort((a, b) => {
    const aLocal = a.tags.some((t) => localTags.has(t)) ? 1 : 0;
    const bLocal = b.tags.some((t) => localTags.has(t)) ? 1 : 0;
    if (aLocal !== bLocal) return bLocal - aLocal;
    return scoreByInterest(b, interests, mustVisit) - scoreByInterest(a, interests, mustVisit);
  });
}

function orderForOptimizedRoute(places: PlaceCandidate[], interests: string[], mustVisit: string[]): PlaceCandidate[] {
  const scored = [...places].sort((a, b) => scoreByInterest(b, interests, mustVisit) - scoreByInterest(a, interests, mustVisit));
  if (scored.length === 0) return [];

  // 최근접 이웃 휴리스틱으로 전체 이동 거리를 줄인다 (기획서 58항).
  const remaining = [...scored];
  const ordered: PlaceCandidate[] = [remaining.shift() as PlaceCandidate];
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    remaining.forEach((candidate, index) => {
      const distance = haversineMeters(last, candidate);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    ordered.push(remaining.splice(nearestIndex, 1)[0]);
  }
  return ordered;
}

function selectTopPlaces(ordered: PlaceCandidate[], count: number, mustVisit: string[]): PlaceCandidate[] {
  const must = ordered.filter((p) => mustVisit.some((name) => p.name.includes(name) || name.includes(p.name)));
  const rest = ordered.filter((p) => !must.includes(p));
  return [...must, ...rest].slice(0, Math.max(count, must.length));
}

function chunkByDay(places: PlaceCandidate[], tripDays: number, placesPerDay: number): PlaceCandidate[][] {
  const days: PlaceCandidate[][] = Array.from({ length: tripDays }, () => []);
  places.forEach((place, index) => {
    const dayIndex = Math.min(Math.floor(index / placesPerDay), tripDays - 1);
    days[dayIndex].push(place);
  });
  return days;
}

function buildDailySchedule(
  dayPlaces: PlaceCandidate[],
  dayNumber: number,
  mobility: string[],
): { drafts: RoutePlaceDraft[]; distanceMeters: number } {
  const drafts: RoutePlaceDraft[] = [];
  let currentMinutes = START_MINUTES;
  let orderIndex = 0;
  let minutesSinceRest = 0;
  let distanceMeters = 0;
  let previous: PlaceCandidate | null = null;
  const primaryMobility = mobility[0] ?? 'WALK';
  let mealsInserted = { lunch: false, dinner: false };

  for (const place of dayPlaces) {
    let travelMinutes = 0;
    if (previous) {
      const distance = haversineMeters(previous, place);
      distanceMeters += distance;
      travelMinutes = estimateTravelMinutes(distance, primaryMobility);
      currentMinutes += travelMinutes;
    }

    // 식사 시간대에 걸치면 식사 슬롯을 먼저 배치한다.
    if (!mealsInserted.lunch && currentMinutes >= LUNCH_WINDOW[0] && currentMinutes <= LUNCH_WINDOW[1]) {
      drafts.push({
        place,
        dayNumber,
        orderIndex: orderIndex++,
        arrivalTime: minutesToTimeStr(currentMinutes),
        stayMinutes: 60,
        travelMinutes: 0,
        slotType: 'MEAL',
        note: '점심 식사',
      });
      currentMinutes += 60;
      mealsInserted.lunch = true;
      minutesSinceRest = 0;
    }
    if (!mealsInserted.dinner && currentMinutes >= DINNER_WINDOW[0] && currentMinutes <= DINNER_WINDOW[1]) {
      drafts.push({
        place,
        dayNumber,
        orderIndex: orderIndex++,
        arrivalTime: minutesToTimeStr(currentMinutes),
        stayMinutes: 70,
        travelMinutes: 0,
        slotType: 'MEAL',
        note: '저녁 식사',
      });
      currentMinutes += 70;
      mealsInserted.dinner = true;
      minutesSinceRest = 0;
    }

    if (minutesSinceRest >= REST_AFTER_MINUTES) {
      drafts.push({
        place,
        dayNumber,
        orderIndex: orderIndex++,
        arrivalTime: minutesToTimeStr(currentMinutes),
        stayMinutes: 30,
        travelMinutes: 0,
        slotType: 'REST',
        note: '휴식',
      });
      currentMinutes += 30;
      minutesSinceRest = 0;
    }

    drafts.push({
      place,
      dayNumber,
      orderIndex: orderIndex++,
      arrivalTime: minutesToTimeStr(currentMinutes),
      stayMinutes: place.estimatedStayMinutes,
      mobilityToHere: previous ? primaryMobility : undefined,
      travelMinutes,
      slotType: 'PLACE',
    });

    currentMinutes += place.estimatedStayMinutes;
    minutesSinceRest += place.estimatedStayMinutes;
    previous = place;
  }

  return { drafts, distanceMeters };
}

function estimateBudget(budget: string, budgetAmount: number | undefined | null, tripDays: number, avgPriceLevel: number) {
  if (budget === 'CUSTOM' && budgetAmount) {
    return { min: Math.round(budgetAmount * 0.9), max: Math.round(budgetAmount * 1.1) };
  }
  const [dayMin, dayMax] = DAILY_BUDGET_RANGE[budget] ?? DAILY_BUDGET_RANGE.NORMAL;
  const priceMultiplier = 0.85 + avgPriceLevel * 0.1;
  return {
    min: Math.round(dayMin * tripDays * priceMultiplier),
    max: Math.round(dayMax * tripDays * priceMultiplier),
  };
}

function buildRoute(
  type: RouteTypeKey,
  name: string,
  reasoningSummary: string,
  input: RecommendationInput,
  orderedCandidates: PlaceCandidate[],
): RouteDraft {
  const placesPerDay = PLACES_PER_DAY_BY_PACE[input.pace] ?? PLACES_PER_DAY_BY_PACE.NORMAL;
  const selected = selectTopPlaces(orderedCandidates, placesPerDay * input.tripDays, input.mustVisit);
  const days = chunkByDay(selected, input.tripDays, placesPerDay);

  const allDrafts: RoutePlaceDraft[] = [];
  let totalDistanceMeters = 0;
  days.forEach((dayPlaces, index) => {
    const { drafts, distanceMeters } = buildDailySchedule(dayPlaces, index + 1, input.mobility);
    allDrafts.push(...drafts);
    totalDistanceMeters += distanceMeters;
  });

  const totalDurationMinutes = allDrafts.reduce((sum, d) => sum + d.stayMinutes + d.travelMinutes, 0);
  const avgPriceLevel =
    selected.reduce((sum, p) => sum + (p.priceLevel ?? 2), 0) / Math.max(selected.length, 1);
  const { min, max } = estimateBudget(input.budget, input.budgetAmount, input.tripDays, avgPriceLevel);

  return {
    type,
    name,
    estimatedBudgetMin: min,
    estimatedBudgetMax: max,
    totalDurationMinutes,
    totalDistanceMeters: Math.round(totalDistanceMeters),
    reasoningSummary,
    places: allDrafts,
  };
}

@Injectable()
export class RecommendationService {
  /**
   * 사용자가 지도에서 장소를 추가/삭제/순서변경한 뒤 호출한다.
   * 새 순서를 그대로 존중하고 도착시간·이동시간·총 거리만 다시 계산한다
   * (기획서 13항: 사용자의 직접 수정을 최우선으로 반영).
   */
  recalculateSchedule(
    daysOfPlaces: PlaceCandidate[][],
    mobility: string[],
    budget: string,
    budgetAmount: number | undefined | null,
  ) {
    const allDrafts: RoutePlaceDraft[] = [];
    let totalDistanceMeters = 0;
    daysOfPlaces.forEach((dayPlaces, index) => {
      const { drafts, distanceMeters } = buildDailySchedule(dayPlaces, index + 1, mobility);
      allDrafts.push(...drafts);
      totalDistanceMeters += distanceMeters;
    });

    const totalDurationMinutes = allDrafts.reduce((sum, d) => sum + d.stayMinutes + d.travelMinutes, 0);
    const flatPlaces = daysOfPlaces.flat();
    const avgPriceLevel =
      flatPlaces.reduce((sum, p) => sum + (p.priceLevel ?? 2), 0) / Math.max(flatPlaces.length, 1);
    const { min, max } = estimateBudget(budget, budgetAmount, daysOfPlaces.length, avgPriceLevel);

    return {
      places: allDrafts,
      totalDurationMinutes,
      totalDistanceMeters: Math.round(totalDistanceMeters),
      estimatedBudgetMin: min,
      estimatedBudgetMax: max,
    };
  }

  generateRoutes(input: RecommendationInput): RouteDraft[] {
    const budgetOrdered = sortForBudgetRoute(input.candidates, input.interests, input.mustVisit);
    const optimizedOrdered = orderForOptimizedRoute(input.candidates, input.interests, input.mustVisit);
    const localOrdered = sortForLocalRoute(input.candidates, input.interests, input.mustVisit);

    return [
      buildRoute(
        'BUDGET',
        `${input.destination} 가성비 루트`,
        '예산과 취향을 고려해 비용이 낮은 장소 위주로 구성했어요. 이동시간과 활동시간을 확인하고 직접 수정할 수 있어요.',
        input,
        budgetOrdered,
      ),
      buildRoute(
        'OPTIMIZED',
        `${input.destination} 동선 최적화 루트`,
        '이동 거리와 이동 시간을 최소화하도록 장소 순서를 계산했어요. 체력 소모를 줄이고 싶을 때 적합해요.',
        input,
        optimizedOrdered,
      ),
      buildRoute(
        'LOCAL',
        `${input.destination} 현지 감성 루트`,
        '관광객에게 유명한 곳만 나열하지 않고, 로컬 분위기와 조용한 장소를 우선 포함했어요.',
        input,
        localOrdered,
      ),
    ];
  }
}
