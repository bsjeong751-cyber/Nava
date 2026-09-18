import { PlaceCandidate } from '../places/place-provider.interface';

export type RouteTypeKey = 'BUDGET' | 'OPTIMIZED' | 'LOCAL';

export interface RecommendationInput {
  destination: string;
  tripDays: number; // 1박2일 = 2일
  interests: string[];
  mustVisit: string[];
  budget: string; // Budget enum 값
  budgetAmount?: number | null;
  pace: string; // TravelPace enum 값
  mobility: string[]; // Mobility enum 값 목록
  candidates: PlaceCandidate[];
}

export interface RoutePlaceDraft {
  place: PlaceCandidate;
  dayNumber: number;
  orderIndex: number;
  arrivalTime: string;
  stayMinutes: number;
  mobilityToHere?: string;
  travelMinutes: number;
  slotType: 'PLACE' | 'REST' | 'MEAL';
  note?: string;
}

export interface RouteDraft {
  type: RouteTypeKey;
  name: string;
  estimatedBudgetMin: number;
  estimatedBudgetMax: number;
  totalDurationMinutes: number;
  totalDistanceMeters: number;
  reasoningSummary: string;
  places: RoutePlaceDraft[];
}
