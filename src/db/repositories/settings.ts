/** Key/value app settings. Currently: the theme preference. */

import { db } from '@/db/client';

export type ThemePref = 'system' | 'light' | 'dark';

function get(key: string): string | null {
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

function set(key: string, value: string): void {
  db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}

export function getThemePref(): ThemePref {
  const v = get('themePref');
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
}

export function setThemePref(pref: ThemePref): void {
  set('themePref', pref);
}
