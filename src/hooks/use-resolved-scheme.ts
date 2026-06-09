/**
 * Resolves the actual color scheme to use, combining the user's saved
 * preference (System / Light / Dark) with the device's current scheme.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/store/settings';

export type Scheme = 'light' | 'dark';

export function useResolvedScheme(): Scheme {
  const pref = useSettingsStore((s) => s.themePref);
  const device = useColorScheme();
  if (pref === 'light') return 'light';
  if (pref === 'dark') return 'dark';
  return device === 'dark' ? 'dark' : 'light';
}
