/**
 * The companion roster. For now Seatmate ships with a single companion, Ella.
 * This stays an array (rather than a lone object) so additional companions can
 * be slotted in later without changing how screens consume it.
 */

import type { Companion, CompanionId } from './types';

export const ELLA: Companion = {
  id: 'ella',
  name: 'Ella',
  gender: 'female',
  waistUp: require('../../assets/images/Ella/ella-full.png'),
  fullBody: require('../../assets/images/Ella/ella-full.png'),
  cheerful: require('../../assets/images/Ella/ella-cheer.png'),
  ask: require('../../assets/images/Ella/ella-ask.png'),
  avatar: require('../../assets/images/Ella/ella-avatar.png'),
  color: '#27AE60',
  tagline: 'Calm, gentle, encouraging.',
  blurb:
    'A steady, reassuring presence. Ella helps you breathe, refocus, and keep going at your own pace, one small step at a time.',
};

export const COMPANIONS: Companion[] = [ELLA];

const BY_ID: Record<CompanionId, Companion> = Object.fromEntries(
  COMPANIONS.map((c) => [c.id, c]),
) as Record<CompanionId, Companion>;

export function getCompanion(id: CompanionId): Companion {
  return BY_ID[id];
}
