interface LatLng {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_METERS = 6371000;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_METERS * c;
}

// 이동수단별 평균 이동 속도 (m/min) — 실제 지도 API 연동 전까지 사용하는 근사치.
const SPEED_M_PER_MIN: Record<string, number> = {
  WALK: 70,
  PUBLIC_TRANSIT: 350,
  BUS: 300,
  SUBWAY: 500,
  CAR: 500,
  TAXI: 500,
  BICYCLE: 200,
};

export function estimateTravelMinutes(distanceMeters: number, mobility: string): number {
  const speed = SPEED_M_PER_MIN[mobility] ?? SPEED_M_PER_MIN.WALK;
  return Math.max(1, Math.round(distanceMeters / speed));
}
