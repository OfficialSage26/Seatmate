/**
 * The single SQLite connection for the whole app.
 *
 * We use expo-sqlite's *synchronous* API. For a small on-device database the
 * queries are fast enough that blocking the JS thread for a moment is fine, and
 * sync code is much easier to read and reason about than async/await chains.
 */

import * as SQLite from 'expo-sqlite';

import { DDL } from './schema';

export const db = SQLite.openDatabaseSync('seatmate.db');

let initialized = false;

/**
 * Create tables if they don't exist yet. Safe to call multiple times — it only
 * does real work the first time.
 */
export function initDatabase() {
  if (initialized) return;
  // WAL mode = better write performance and concurrency for SQLite.
  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync(DDL);
  runMigrations();
  initialized = true;
}

/**
 * Add columns to tables that were created by an older version of the app.
 * `CREATE TABLE IF NOT EXISTS` won't alter an existing table, so new columns
 * need an explicit, idempotent ALTER.
 */
function runMigrations() {
  ensureColumn('profile', 'birthday', 'TEXT');
  ensureColumn('quizzes', 'isSurprise', 'INTEGER NOT NULL DEFAULT 0');
}

function ensureColumn(table: string, column: string, type: string) {
  const cols = db.getAllSync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (!cols.some((c) => c.name === column)) {
    db.execSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

/**
 * Erase all user data (used by Settings → Reset data). Keeps the table
 * structure; just clears the rows so onboarding starts fresh.
 */
export function resetAllData() {
  db.execSync('DELETE FROM profile; DELETE FROM subjects; DELETE FROM quizzes; DELETE FROM settings;');
}
