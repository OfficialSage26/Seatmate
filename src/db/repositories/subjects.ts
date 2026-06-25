/** CRUD for subjects/classes. Quizzes reference subjects by name. */

import { db } from '@/db/client';
import type { Subject } from '@/db/schema';
import { logActivity } from './activity';

export function listSubjects(): Subject[] {
  return db.getAllSync<Subject>('SELECT * FROM subjects ORDER BY name COLLATE NOCASE ASC');
}

export function countSubjects(): number {
  const row = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM subjects');
  return row?.n ?? 0;
}

export function addSubject(name: string, color: string): void {
  db.runSync(
    'INSERT INTO subjects (name, color, createdAt) VALUES (?, ?, ?)',
    name,
    color,
    new Date().toISOString(),
  );
  logActivity();
}

export function deleteSubject(id: number): void {
  db.runSync('DELETE FROM subjects WHERE id = ?', id);
}
