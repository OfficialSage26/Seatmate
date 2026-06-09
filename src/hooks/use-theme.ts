/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useResolvedScheme } from '@/hooks/use-resolved-scheme';

export function useTheme() {
  // Honors the saved Light/Dark/System preference, falling back to the device.
  return Colors[useResolvedScheme()];
}
