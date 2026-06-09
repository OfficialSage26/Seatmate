/**
 * Database schema for Seatmate.
 *
 * One file holds both the SQL that creates the tables (`DDL`) and the
 * TypeScript row types, so they stay next to each other and easy to keep in
 * sync. Everything is local: no server, no accounts.
 */

import type { CompanionId } from '@/companions/types';

/** A single profile row (we only ever store one, with id = 1). */
export type Profile = {
  id: number;
  name: string;
  age: number;
  /** Date of birth as 'YYYY-MM-DD'. Null if the user entered nothing. */
  birthday: string | null;
  gradeLevel: string;
  /** 'male' | 'female' | 'nonbinary' | 'unspecified' (kept as free text). */
  gender: string;
  companionId: CompanionId;
  createdAt: string; // ISO timestamp
};

/** A subject/class the student is taking. Quizzes reference these by name. */
export type Subject = {
  id: number;
  name: string;
  color: string; // hex accent for the subject
  createdAt: string;
};

/**
 * An upcoming or past quiz/exam.
 *
 * `maxScore` of 0 means "secret" — the total is unknown until the quiz starts,
 * so we capture it when the score is logged. `isSurprise` (0/1) marks a pop
 * quiz: no date is picked up front, it's filed under today automatically.
 */
export type Quiz = {
  id: number;
  title: string;
  subject: string;
  date: string; // ISO date (YYYY-MM-DD)
  maxScore: number; // 0 = secret/unknown
  score: number | null; // null until taken
  isSurprise: number; // 0 | 1
  createdAt: string;
};

/** Simple key/value store for app settings (theme preference, etc.). */
export type SettingRow = { key: string; value: string };

/**
 * Table-creation statements. Run once on app start. `IF NOT EXISTS` makes this
 * safe to run every launch — existing data is left untouched.
 */
export const DDL = `
CREATE TABLE IF NOT EXISTS profile (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  age         INTEGER NOT NULL,
  birthday    TEXT,
  gradeLevel  TEXT    NOT NULL,
  gender      TEXT    NOT NULL,
  companionId TEXT    NOT NULL,
  createdAt   TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT    NOT NULL,
  color     TEXT    NOT NULL DEFAULT '#208AEF',
  createdAt TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS quizzes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  title     TEXT    NOT NULL,
  subject   TEXT    NOT NULL DEFAULT '',
  date      TEXT    NOT NULL,
  maxScore  INTEGER NOT NULL DEFAULT 0,
  score     INTEGER,
  isSurprise INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
