/**
 * Nunito — the app's official typeface, loaded as static weight faces via
 * @expo-google-fonts/nunito. Variable fonts aren't reliable across iOS and
 * Android (per the Expo docs), so each weight is its own font family and we map
 * a requested `fontWeight` to the matching face.
 */

import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import type { TextStyle } from 'react-native';

/** The faces handed to `useFonts` in the root layout. */
export const NunitoFonts = {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
};

/** Family used before the numeric weight resolves to something heavier. */
export const NunitoRegular = 'Nunito_400Regular';

/**
 * Resolve a React Native `fontWeight` (number, '700', 'bold', etc.) to the
 * Nunito face that carries that weight. Because the face already encodes the
 * weight, callers should drop `fontWeight` and rely on the family alone — this
 * avoids the OS faux-bolding an already-bold face.
 */
export function fontFamilyForWeight(weight?: TextStyle['fontWeight']): string {
  let n: number;
  if (typeof weight === 'number') {
    n = weight;
  } else if (weight === 'bold') {
    n = 700;
  } else if (weight === 'normal' || weight == null) {
    n = 400;
  } else {
    n = parseInt(weight, 10);
    if (Number.isNaN(n)) n = 400;
  }

  if (n >= 900) return 'Nunito_900Black';
  if (n >= 800) return 'Nunito_800ExtraBold';
  if (n >= 700) return 'Nunito_700Bold';
  if (n >= 600) return 'Nunito_600SemiBold';
  if (n >= 500) return 'Nunito_500Medium';
  return 'Nunito_400Regular';
}
