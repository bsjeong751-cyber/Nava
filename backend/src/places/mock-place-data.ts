import { PlaceCandidate } from './place-provider.interface';

// MOCK DATA — 실제 지도/장소 API 연동 전까지 사용하는 시드 데이터.
// source 필드는 Place 엔티티 저장 시 'MOCK'으로 명시된다 (기획서 21, 75항 원칙).
export const MOCK_PLACES_BY_DESTINATION: Record<string, PlaceCandidate[]> = {
  서울: [
    { externalId: 'seoul-01', name: '경복궁', category: '관광명소', latitude: 37.5796, longitude: 126.977, address: '서울 종로구 사직로 161', openingHours: '09:00~18:00', rating: 4.6, reviewCount: 5210, priceLevel: 1, estimatedStayMinutes: 90, tags: ['역사', '관광명소', '사진'], description: '조선 왕조의 법궁' },
    { externalId: 'seoul-02', name: '북촌한옥마을', category: '관광명소', latitude: 37.5826, longitude: 126.9838, address: '서울 종로구 계동길', openingHours: '상시', rating: 4.3, reviewCount: 3899, priceLevel: 1, estimatedStayMinutes: 60, tags: ['역사', '로컬감성', '사진'], description: '전통 한옥이 모여있는 골목' },
    { externalId: 'seoul-03', name: '성수동 카페거리', category: '카페', latitude: 37.5445, longitude: 127.0559, address: '서울 성동구 성수동', openingHours: '10:00~22:00', rating: 4.5, reviewCount: 2200, priceLevel: 2, estimatedStayMinutes: 70, tags: ['카페', '로컬감성', '쇼핑'], description: '감성 카페와 편집샵이 모인 거리' },
    { externalId: 'seoul-04', name: '광장시장', category: '맛집', latitude: 37.5701, longitude: 126.9997, address: '서울 종로구 창경궁로 88', openingHours: '09:00~23:00', rating: 4.4, reviewCount: 8800, priceLevel: 1, estimatedStayMinutes: 60, tags: ['맛집', '로컬감성'], description: '빈대떡과 마약김밥으로 유명한 전통시장' },
    { externalId: 'seoul-05', name: '남산타워', category: '관광명소', latitude: 37.5512, longitude: 126.9882, address: '서울 용산구 남산공원길 105', openingHours: '10:00~23:00', rating: 4.4, reviewCount: 9600, priceLevel: 2, estimatedStayMinutes: 90, tags: ['야경', '관광명소', '사진'], description: '서울 시내를 조망하는 랜드마크' },
    { externalId: 'seoul-06', name: '을지로 노가리골목', category: '맛집', latitude: 37.5663, longitude: 126.9918, address: '서울 중구 을지로3가', openingHours: '17:00~24:00', rating: 4.2, reviewCount: 1500, priceLevel: 1, estimatedStayMinutes: 80, tags: ['맛집', '로컬감성', '야경'], description: '노포 감성 골목 술집' },
    { externalId: 'seoul-07', name: '한강공원(반포)', category: '자연', latitude: 37.5133, longitude: 126.9976, address: '서울 서초구 신반포로11길 40', openingHours: '상시', rating: 4.5, reviewCount: 4300, priceLevel: 1, estimatedStayMinutes: 60, tags: ['자연', '야경', '조용한장소'], description: '무지개분수와 야경 명소' },
    { externalId: 'seoul-08', name: '이태원 앤틱거리 카페', category: '카페', latitude: 37.5344, longitude: 126.9947, address: '서울 용산구 이태원동', openingHours: '11:00~21:00', rating: 4.3, reviewCount: 640, priceLevel: 2, estimatedStayMinutes: 50, tags: ['카페', '조용한장소', '로컬감성'], description: '한적한 앤틱 소품 카페' },
  ],
  부산: [
    { externalId: 'busan-01', name: '해운대 해수욕장', category: '자연', latitude: 35.1587, longitude: 129.1604, address: '부산 해운대구 우동', openingHours: '상시', rating: 4.5, reviewCount: 12000, priceLevel: 1, estimatedStayMinutes: 90, tags: ['자연', '관광명소', '사진'], description: '부산 대표 해변' },
    { externalId: 'busan-02', name: '감천문화마을', category: '관광명소', latitude: 35.0975, longitude: 129.0107, address: '부산 사하구 감내2로 203', openingHours: '09:00~18:00', rating: 4.4, reviewCount: 8700, priceLevel: 1, estimatedStayMinutes: 90, tags: ['사진', '로컬감성', '관광명소'], description: '알록달록한 산비탈 마을' },
    { externalId: 'busan-03', name: '자갈치시장', category: '맛집', latitude: 35.0968, longitude: 129.0306, address: '부산 중구 자갈치해안로 52', openingHours: '05:00~22:00', rating: 4.3, reviewCount: 5300, priceLevel: 2, estimatedStayMinutes: 60, tags: ['맛집', '로컬감성'], description: '신선한 해산물 시장' },
    { externalId: 'busan-04', name: '광안리 카페거리', category: '카페', latitude: 35.1534, longitude: 129.1186, address: '부산 수영구 광안해변로', openingHours: '10:00~22:00', rating: 4.5, reviewCount: 3400, priceLevel: 2, estimatedStayMinutes: 70, tags: ['카페', '야경', '사진'], description: '광안대교 뷰 카페 거리' },
    { externalId: 'busan-05', name: '태종대', category: '자연', latitude: 35.0514, longitude: 129.0868, address: '부산 영도구 전망로 24', openingHours: '04:00~24:00', rating: 4.4, reviewCount: 4100, priceLevel: 1, estimatedStayMinutes: 100, tags: ['자연', '조용한장소'], description: '해안 절벽 산책로' },
  ],
  도쿄: [
    { externalId: 'tokyo-01', name: '센소지', category: '관광명소', latitude: 35.7148, longitude: 139.7967, address: '東京都台東区浅草2-3-1', openingHours: '06:00~17:00', rating: 4.5, reviewCount: 15000, priceLevel: 1, estimatedStayMinutes: 80, tags: ['역사', '관광명소', '사진'], description: '도쿄에서 가장 오래된 사찰' },
    { externalId: 'tokyo-02', name: '시부야 스카이', category: '관광명소', latitude: 35.6595, longitude: 139.7005, address: '東京都渋谷区渋谷2-24-12', openingHours: '10:00~22:30', rating: 4.6, reviewCount: 9200, priceLevel: 3, estimatedStayMinutes: 60, tags: ['야경', '사진', '관광명소'], description: '시부야 전망대' },
    { externalId: 'tokyo-03', name: '츠키지 장외시장', category: '맛집', latitude: 35.6654, longitude: 139.7707, address: '東京都中央区築地4', openingHours: '05:00~14:00', rating: 4.3, reviewCount: 7600, priceLevel: 2, estimatedStayMinutes: 70, tags: ['맛집', '로컬감성'], description: '신선한 초밥과 해산물 골목' },
    { externalId: 'tokyo-04', name: '기요스미 시라카와 카페거리', category: '카페', latitude: 35.6812, longitude: 139.8007, address: '東京都江東区清澄', openingHours: '09:00~19:00', rating: 4.4, reviewCount: 1200, priceLevel: 2, estimatedStayMinutes: 60, tags: ['카페', '조용한장소', '로컬감성'], description: '스페셜티 커피 로스터리 거리' },
    { externalId: 'tokyo-05', name: '도쿄 디즈니랜드', category: '테마파크', latitude: 35.6329, longitude: 139.8804, address: '千葉県浦安市舞浜1-1', openingHours: '08:00~22:00', rating: 4.7, reviewCount: 32000, priceLevel: 4, estimatedStayMinutes: 300, tags: ['액티비티', '가족여행', '관광명소'], description: '대표 테마파크' },
  ],
};

export function getMockPlacesFor(destination: string): PlaceCandidate[] {
  return MOCK_PLACES_BY_DESTINATION[destination] ?? MOCK_PLACES_BY_DESTINATION['서울'];
}
