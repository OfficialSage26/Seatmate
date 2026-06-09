/** CRUD for quizzes/exams (regular and surprise). */

import { todayISO } from '@/constants/academic';
import { db } from '@/db/client';
import type { Quiz } from '@/db/schema';

/** All quizzes, soonest date first. */
export function listQuizzes(): Quiz[] {
  return db.getAllSync<Quiz>('SELECT * FROM quizzes ORDER BY date ASC, id DESC');
}

/**
 * Upcoming = scheduled, not-yet-scored quizzes dated today or later. Surprise
 * quizzes are excluded — a pop quiz has already happened; it's awaiting a score,
 * not a future event.
 */
export function listUpcomingQuizzes(): Quiz[] {
  return db.getAllSync<Quiz>(
    'SELECT * FROM quizzes WHERE score IS NULL AND isSurprise = 0 AND date >= ? ORDER BY date ASC',
    todayISO(),
  );
}

export function countTakenQuizzes(): number {
  const row = db.getFirstSync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM quizzes WHERE score IS NOT NULL',
  );
  return row?.n ?? 0;
}

type NewQuiz = {
  title: string;
  subject: string;
  date: string;
  /** 0 = secret/unknown until the quiz starts. */
  maxScore: number;
  isSurprise?: boolean;
};

export function addQuiz(input: NewQuiz): void {
  db.runSync(
    `INSERT INTO quizzes (title, subject, date, maxScore, score, isSurprise, createdAt)
     VALUES (?, ?, ?, ?, NULL, ?, ?)`,
    input.title,
    input.subject,
    input.date,
    input.maxScore,
    input.isSurprise ? 1 : 0,
    new Date().toISOString(),
  );
}

/** A surprise/pop quiz: filed under today (local), total kept secret. */
export function addSurpriseQuiz(title: string, subject: string): void {
  addQuiz({ title, subject, date: todayISO(), maxScore: 0, isSurprise: true });
}

/**
 * Record the score once a quiz has been taken. If the quiz's total was secret
 * (maxScore 0), pass the revealed total to store it at the same time.
 */
export function setQuizScore(id: number, score: number, revealedMax?: number): void {
  if (revealedMax && revealedMax > 0) {
    db.runSync('UPDATE quizzes SET score = ?, maxScore = ? WHERE id = ?', score, revealedMax, id);
  } else {
    db.runSync('UPDATE quizzes SET score = ? WHERE id = ?', score, id);
  }
}

export function deleteQuiz(id: number): void {
  db.runSync('DELETE FROM quizzes WHERE id = ?', id);
}
