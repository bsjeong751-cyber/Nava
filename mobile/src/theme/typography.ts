import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography: Record<string, TextStyle> = {
  title: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  heading: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  subheading: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: colors.textPrimary, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  small: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
};
