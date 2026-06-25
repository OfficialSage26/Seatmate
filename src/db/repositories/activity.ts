/**
 * Study-activity log: one row per day the student did something in the app.
 * Drives the home-screen streak and the weekly study graph.
 *
 * The date math lives in pure helpers (no SQLite) so it can be reasoned about
 * and unit-tested on its own; the exported repo functions just load the rows
 * and hand them to those helpers.
 */

import { todayISO } from '@/constants/academic';
import { db } from '@/db/client';

export type WeekBar = { day: string; label: string; count: number; isToday: boolean };

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Shift a 'YYYY-MM-DD' date by whole days, staying in local time. */
function shiftDay(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function weekdayInitial(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return WEEKDAY_INITIALS[new Date(y, m - 1, d).getDay()];
}

/**
 * Consecutive days with activity, counting back from today. Includes a grace
 * day: if today has nothing yet but yesterday did, the streak still stands, so
 * it doesn't reset to 0 every morning until the first action of the day.
 */
export function computeStreak(activeDays: Set<string>, today: string): number {
  let cursor = activeDays.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (activeDays.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

/** The last 7 days ending today (today rightmost), with per-day counts. */
export function computeWeek(counts: Map<string, number>, today: string): WeekBar[] {
  const bars: WeekBar[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = shiftDay(today, -i);
    bars.push({ day, label: weekdayInitial(day), count: counts.get(day) ?? 0, isToday: i === 0 });
  }
  return bars;
}

/**
 * Percentage change in activity, this week (last 7 days) vs the 7 days before.
 * Null when there's no prior-week data to compare against (so the UI can hide
 * the figure rather than show a meaningless number).
 */
export function computeDelta(counts: Map<string, number>, today: string): number | null {
  let current = 0;
  let previous = 0;
  for (let i = 0; i < 7; i++) current += counts.get(shiftDay(today, -i)) ?? 0;
  for (let i = 7; i < 14; i++) previous += counts.get(shiftDay(today, -i)) ?? 0;
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

// ── DB-backed accessors ────────────────────────────────────────────────────

/** Record one study action against today's bucket (upsert + increment). */
export function logActivity(): void {
  db.runSync(
    'INSERT INTO activity (day, count) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET count = count + 1',
    todayISO(),
  );
}

function activeDaySet(): Set<string> {
  const rows = db.getAllSync<{ day: string }>('SELECT day FROM activity WHERE count > 0');
  return new Set(rows.map((r) => r.day));
}

function countMap(): Map<string, number> {
  const rows = db.getAllSync<{ day: string; count: number }>('SELECT day, count FROM activity');
  return new Map(rows.map((r) => [r.day, r.count]));
}

export function getStreak(): number {
  return computeStreak(activeDaySet(), todayISO());
}

export function getWeekActivity(): WeekBar[] {
  return computeWeek(countMap(), todayISO());
}

export function getWeekDelta(): number | null {
  return computeDelta(countMap(), todayISO());
}
