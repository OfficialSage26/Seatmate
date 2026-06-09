/**
 * Reads/writes for the single profile row. The profile is what onboarding
 * produces; its presence is how we know onboarding is complete.
 */

import { db } from '@/db/client';
import type { Profile } from '@/db/schema';

const PROFILE_ID = 1;

/** Returns the saved profile, or null if onboarding hasn't happened yet. */
export function getProfile(): Profile | null {
  return db.getFirstSync<Profile>('SELECT * FROM profile WHERE id = ?', PROFILE_ID) ?? null;
}

/** Creates or replaces the profile (we only ever keep one). */
export function saveProfile(input: Omit<Profile, 'id' | 'createdAt'>): Profile {
  const createdAt = new Date().toISOString();
  db.runSync(
    `INSERT OR REPLACE INTO profile (id, name, age, birthday, gradeLevel, gender, companionId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    PROFILE_ID,
    input.name,
    input.age,
    input.birthday,
    input.gradeLevel,
    input.gender,
    input.companionId,
    createdAt,
  );
  return { id: PROFILE_ID, createdAt, ...input };
}

/** Update just the chosen companion (used by the "change companion" setting). */
export function updateCompanion(companionId: Profile['companionId']) {
  db.runSync('UPDATE profile SET companionId = ? WHERE id = ?', companionId, PROFILE_ID);
}

/** Wipe everything — handy for testing onboarding again. */
export function resetProfile() {
  db.runSync('DELETE FROM profile WHERE id = ?', PROFILE_ID);
}
