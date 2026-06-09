/** Grade/year options for onboarding, grouped the way schools are structured. */

import type { DropdownSection } from '@/components/dropdown';

export const GRADE_SECTIONS: DropdownSection[] = [
  {
    title: 'High School',
    options: [
      { label: 'Grade 7', value: 'Grade 7' },
      { label: 'Grade 8', value: 'Grade 8' },
      { label: 'Grade 9', value: 'Grade 9' },
      { label: 'Grade 10', value: 'Grade 10' },
    ],
  },
  {
    title: 'Senior High School',
    options: [
      { label: 'Grade 11', value: 'Grade 11' },
      { label: 'Grade 12', value: 'Grade 12' },
    ],
  },
  {
    title: 'College',
    options: [
      { label: 'College – 1st Year', value: 'College - 1st Year' },
      { label: 'College – 2nd Year', value: 'College - 2nd Year' },
      { label: 'College – 3rd Year', value: 'College - 3rd Year' },
      { label: 'College – 4th Year', value: 'College - 4th Year' },
    ],
  },
];

/** Preset accent colors a student can tag a subject with. */
export const SUBJECT_COLORS = [
  '#208AEF', // blue
  '#27AE60', // green
  '#EB5757', // red
  '#9B51E0', // purple
  '#F2994A', // orange
  '#F2C94C', // yellow
  '#2D9CDB', // sky
  '#EB5D9B', // pink
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Compute age in whole years from a birth date to today. */
export function ageFromBirthday(year: number, month1to12: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const beforeBirthdayThisYear =
    today.getMonth() + 1 < month1to12 ||
    (today.getMonth() + 1 === month1to12 && today.getDate() < day);
  if (beforeBirthdayThisYear) age -= 1;
  return age;
}

/** Number of days in a given month/year (handles leap years). */
export function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

/**
 * Today's date as a LOCAL 'YYYY-MM-DD' string. We avoid toISOString() here
 * because that returns the UTC day, which can be off by one near midnight and
 * wouldn't match the calendar picker (which uses the local day).
 */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
