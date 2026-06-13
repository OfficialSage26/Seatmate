/** CRUD for free-form study notes. */

import { db } from '@/db/client';
import type { Note } from '@/db/schema';

export function listNotes(): Note[] {
  return db.getAllSync<Note>('SELECT * FROM notes ORDER BY updatedAt DESC');
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
}

export function updateNote(id: number, title: string, body: string): void {
  db.runSync(
    'UPDATE notes SET title = ?, body = ?, updatedAt = ? WHERE id = ?',
    title,
    body,
    new Date().toISOString(),
    id,
  );
}

export function deleteNote(id: number): void {
  db.runSync('DELETE FROM notes WHERE id = ?', id);
}
