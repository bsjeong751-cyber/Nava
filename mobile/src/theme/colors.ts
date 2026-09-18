// 여행 일기장 / 로컬 가이드북 감성의 베이지톤 팔레트 (기획서 46, 80항).
// 과도하게 미래적인 AI UI, 네온 컬러는 지양한다.
export const colors = {
  background: '#F6F0E4', // 종이 질감의 따뜻한 베이지
  surface: '#FFFDF8',
  surfaceAlt: '#EFE6D4',
  border: '#E1D4B8',
  textPrimary: '#3A2E1F',
  textSecondary: '#7A6B54',
  textMuted: '#A6987F',
  accent: '#C97C4B', // 테라코타 톤 포인트 컬러
  accentSoft: '#EBD9C6',
  success: '#6B8F5A',
  warning: '#C4642F',
  danger: '#B24A3B',
  white: '#FFFFFF',
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
