/**
 * Global profile state. Screens read `profile` from here instead of hitting the
 * database directly, and onboarding writes to it. The store is the single
 * source of truth in the UI; the database is where it persists.
 */

import { create } from 'zustand';

import * as profileRepo from '@/db/repositories/profile';
import type { Profile } from '@/db/schema';
import type { CompanionId } from '@/companions/types';

type ProfileState = {
  profile: Profile | null;
  /** False until we've checked the database on app start. */
  hydrated: boolean;
  /** Load the saved profile from SQLite into memory. Call once on startup. */
  hydrate: () => void;
  /** Save a brand-new profile (the end of onboarding). */
  createProfile: (input: Omit<Profile, 'id' | 'createdAt'>) => void;
  /** Swap the chosen companion. */
  changeCompanion: (companionId: CompanionId) => void;
  /** Clear the profile (e.g. to re-run onboarding while testing). */
  reset: () => void;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  hydrated: false,

  hydrate: () => {
    set({ profile: profileRepo.getProfile(), hydrated: true });
  },

  createProfile: (input) => {
    const saved = profileRepo.saveProfile(input);
    set({ profile: saved });
  },

  changeCompanion: (companionId) => {
    profileRepo.updateCompanion(companionId);
    const current = get().profile;
    if (current) set({ profile: { ...current, companionId } });
  },

  reset: () => {
    profileRepo.resetProfile();
    set({ profile: null });
  },
}));
