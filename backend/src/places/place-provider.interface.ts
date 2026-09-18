// 장소 검색/조회를 외부 지도 API로부터 추상화한 인터페이스 (기획서 75, 76항).
// 실제 Mapbox/지도 API 키가 연동되기 전까지는 MockPlaceProvider를 사용한다.
export interface PlaceCandidate {
  externalId: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  openingHours?: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number; // 1(저렴) ~ 4(고급)
  estimatedStayMinutes: number;
  tags: string[];
  description?: string;
  imageUrl?: string;
}

export interface PlaceProvider {
  /** 여행지와 검색어(취향/키워드)로 후보 장소를 찾는다. */
  search(destination: string, query?: string): Promise<PlaceCandidate[]>;
  /** 사용자가 직접 입력한 장소명을 실제 장소 후보와 매칭한다. */
  matchByName(destination: string, name: string): Promise<PlaceCandidate[]>;
}

export const PLACE_PROVIDER = Symbol('PLACE_PROVIDER');
