// 백엔드 API 응답과 짝을 맞춘 타입. backend/prisma/schema.prisma의 enum과 동일하다.

export type Budget = 'VERY_LOW' | 'LOW' | 'NORMAL' | 'COMFORTABLE' | 'LUXURY' | 'CUSTOM';
export type TravelPace = 'RELAXED' | 'NORMAL' | 'ACTIVE' | 'INTENSE';
export type Mobility = 'WALK' | 'PUBLIC_TRANSIT' | 'BUS' | 'SUBWAY' | 'CAR' | 'TAXI' | 'BICYCLE';
export type RouteType = 'BUDGET' | 'OPTIMIZED' | 'LOCAL';

export interface Place {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  openingHours?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  priceLevel?: number | null;
  estimatedStayMinutes: number;
  tags: string[];
  description?: string | null;
  imageUrl?: string | null;
  source: string;
}

export interface RoutePlace {
  id: string;
  placeId: string | null;
  place: Place | null;
  dayNumber: number;
  orderIndex: number;
  arrivalTime: string;
  stayMinutes: number;
  mobilityToHere?: Mobility | null;
  travelMinutes: number;
  slotType: 'PLACE' | 'REST' | 'MEAL';
  note?: string | null;
}

export interface Route {
  id: string;
  tripId: string;
  type: RouteType;
  name: string;
  estimatedBudgetMin: number;
  estimatedBudgetMax: number;
  totalDurationMinutes: number;
  totalDistanceMeters: number;
  reasoningSummary: string;
  places: RoutePlace[];
}

export interface TripDay {
  id: string;
  dayNumber: number;
  date: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
  mustVisit: string[];
  budget: Budget;
  budgetAmount?: number | null;
  pace: TravelPace;
  mobility: Mobility[];
  visibility: 'PRIVATE' | 'LINK' | 'PUBLIC';
  selectedRouteId?: string | null;
  days: TripDay[];
  routes: Route[];
}

export interface TripDraft {
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
  mustVisit: string[];
  budget: Budget;
  budgetAmount?: number;
  pace: TravelPace;
  mobility: Mobility[];
  title?: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  author: { id: string; nickname: string };
  tripId: string;
  title: string;
  description?: string | null;
  likeCount: number;
  saveCount: number;
  viewCount: number;
  createdAt: string;
  trip?: { destination: string; startDate: string; endDate: string; budget: Budget };
}
