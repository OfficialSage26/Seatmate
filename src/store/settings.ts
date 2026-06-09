/**
 * App settings state. Right now this is just the theme preference, persisted
 * locally so the choice survives restarts.
 */

import { create } from 'zustand';

import { getThemePref, setThemePref, type ThemePref } from '@/db/repositories/settings';

type SettingsState = {
  themePref: ThemePref;
  hydrated: boolean;
  hydrate: () => void;
  setThemePref: (pref: ThemePref) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  themePref: 'system',
  hydrated: false,
  hydrate: () => set({ themePref: getThemePref(), hydrated: true }),
  setThemePref: (pref) => {
    setThemePref(pref);
    set({ themePref: pref });
  },
}));
