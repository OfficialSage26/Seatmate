/** CRUD for free-form study notes. */

import { db } from '@/db/client';
import type { Note } from '@/db/schema';
import { logActivity } from './activity';

export function listNotes(): Note[] {
  return db.getAllSync<Note>('SELECT * FROM notes ORDER BY updatedAt DESC');
}

export function countNotes(): number {
  return db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM notes')?.n ?? 0;
}

export function addNote(title: string, body: string): void {
  const now = new Date().toISOString();
  db.runSync(
    'INSERT INTO notes (title, body, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
    title,
    body,
    now,
    now,
  );
  logActivity();
}

export function updateNote(id: number, title: string, body: string): void {
  db.runSync(
    'UPDATE notes SET title = ?, body = ?, updatedAt = ? WHERE id = ?',
    title,
    body,
    new Date().toISOString(),
    id,
  );
  logActivity();
}

export function deleteNote(id: number): void {
  db.runSync('DELETE FROM notes WHERE id = ?', id);
}
