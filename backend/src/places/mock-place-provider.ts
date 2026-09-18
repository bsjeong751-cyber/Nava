import { Injectable } from '@nestjs/common';
import { PlaceCandidate, PlaceProvider } from './place-provider.interface';
import { getMockPlacesFor } from './mock-place-data';

// MOCK DATA — 실제 Mapbox/지도 검색 API를 연동하면 이 클래스를 교체한다.
@Injectable()
export class MockPlaceProvider implements PlaceProvider {
  async search(destination: string, query?: string): Promise<PlaceCandidate[]> {
    const pool = getMockPlacesFor(destination);
    if (!query) return pool;

    const normalized = query.trim().toLowerCase();
    return pool.filter(
      (place) =>
        place.name.toLowerCase().includes(normalized) ||
        place.tags.some((tag) => tag.toLowerCase().includes(normalized)) ||
        place.category.toLowerCase().includes(normalized),
    );
  }

  async matchByName(destination: string, name: string): Promise<PlaceCandidate[]> {
    const pool = getMockPlacesFor(destination);
    const normalized = name.trim().toLowerCase();
    const exact = pool.filter((place) => place.name.toLowerCase() === normalized);
    if (exact.length > 0) return exact;

    // 정확히 일치하지 않으면 후보를 보여준다 (기획서 7항: 잘못된 장소 입력 시 후보 제시).
    return pool.filter((place) => place.name.toLowerCase().includes(normalized));
  }
}
