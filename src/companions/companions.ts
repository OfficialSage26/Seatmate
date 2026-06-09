/** The roster of pickable companions. Emoji are placeholders for real art. */

import type { Companion, CompanionId } from './types';

export const COMPANIONS: Companion[] = [
  {
    id: 'juan',
    name: 'Juan',
    gender: 'male',
    emoji: '😎',
    color: '#F2994A',
    tagline: 'Funny, mischievous — "boys at the back" energy.',
    blurb: 'Cracks jokes and acts lazy, but he\'s surprisingly street-smart and always has your back.',
  },
  {
    id: 'marco',
    name: 'Marco',
    gender: 'male',
    emoji: '🤓',
    color: '#2D9CDB',
    tagline: 'Disciplined academic achiever.',
    blurb: 'Focused and exacting. Holds you to a high standard and helps you build real study habits.',
  },
  {
    id: 'renz',
    name: 'Renz',
    gender: 'male',
    emoji: '🎮',
    color: '#9B51E0',
    tagline: 'Gamer who turns studying into quests.',
    blurb: 'Treats every quiz like a boss fight and every study session like a mission. XP for everything.',
  },
  {
    id: 'stacy',
    name: 'Stacy',
    gender: 'female',
    emoji: '📋',
    color: '#EB5757',
    tagline: 'Strict-but-caring student leader.',
    blurb: 'The responsible one. Pushes you to stay on top of things because she knows you can.',
  },
  {
    id: 'bea',
    name: 'Bea',
    gender: 'female',
    emoji: '💛',
    color: '#F2C94C',
    tagline: 'Cheerful, clingy, endlessly supportive.',
    blurb: 'High energy and always in your corner. Celebrates every win like it\'s her own.',
  },
  {
    id: 'ella',
    name: 'Ella',
    gender: 'female',
    emoji: '🌿',
    color: '#27AE60',
    tagline: 'Calm, gentle, encouraging.',
    blurb: 'A steady, reassuring presence. Helps you breathe, refocus, and keep going at your own pace.',
  },
];

const BY_ID: Record<CompanionId, Companion> = Object.fromEntries(
  COMPANIONS.map((c) => [c.id, c]),
) as Record<CompanionId, Companion>;

export function getCompanion(id: CompanionId): Companion {
  return BY_ID[id];
}
