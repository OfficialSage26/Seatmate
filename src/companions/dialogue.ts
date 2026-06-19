/**
 * The dialogue engine — this is what makes Seatmate feel like a companion
 * instead of a planner, and it runs 100% offline with no AI.
 *
 * Each companion has a bank of pre-written lines grouped by `TriggerKey`. When
 * something happens in the app (a quiz is added, a score is logged, the home
 * screen opens), `getLine()` picks a random line for the active companion and
 * that trigger, and fills in any {placeholders}.
 *
 * To give Ella more personality, just add more lines to her bank below.
 */

import type { CompanionId, DialogueBank, DialogueVars, TriggerKey } from './types';

const BANKS: Record<CompanionId, DialogueBank> = {
  // ── Ella: calm, gentle, encouraging ──────────────────────────────────────
  ella: {
    onboarding_intro: [
      'Hi, I\'m Ella! your seatmate. I\'ll sit right beside you through every quiz and study day.',
    ],
    onboarding_ready: [
      'That\'s everything I need, {name}. Whenever you\'re ready, let\'s begin — together, at your pace.',
    ],
    companion_selected: [
      'I\'m glad we\'re together, {name}. We\'ll take this one step at a time.',
      'No rush, no pressure. I\'ll be right here as you go.',
    ],
    home_greeting: ['Take a breath, {name}. What would you like to focus on?'],
    empty_quizzes: ['Nothing tracked yet — and that\'s okay. Add a quiz whenever you\'re ready.'],
    quiz_added: ['{subject} noted gently. Little by little, you\'ll be prepared.'],
    surprise_quiz: [
      'A surprise quiz on {subject}. Breathe, {name}. Do your best — that\'s enough.',
      'Unexpected, but you can handle it. Stay calm and trust what you know. 🌿',
    ],
    quiz_due_soon: ['{subject} is coming up soon. A calm review today is enough, {name}.'],
    quiz_scored_high: ['{score} — wonderful. Your effort paid off. Be proud of yourself, {name}. 🌿'],
    quiz_scored_mid: ['{score} is okay, {name}. Progress, not perfection. You\'re doing fine.'],
    quiz_scored_low: ['{score} doesn\'t define you, {name}. Breathe. We try again, gently.'],
  },
};

/** Used when a companion has no line for a trigger yet. Keeps things safe. */
const FALLBACK: DialogueBank = {
  home_greeting: ['Hey {name}, let\'s make today count.'],
  empty_quizzes: ['Nothing tracked yet — add a quiz to get started.'],
  quiz_added: ['Got it — {subject} is on the list.'],
  surprise_quiz: ['A surprise quiz on {subject}! Stay calm — you\'ve got this.'],
  quiz_due_soon: ['Heads up: {subject} is coming up soon.'],
  quiz_scored_high: ['Great job — {score}!'],
  quiz_scored_mid: ['Nice, {score}. Keep going.'],
  quiz_scored_low: ['{score} this time. We\'ll get the next one.'],
};

function fill(line: string, vars: DialogueVars): string {
  return line
    .replace(/\{name\}/g, vars.name ?? 'there')
    .replace(/\{subject\}/g, vars.subject ?? 'it')
    .replace(/\{score\}/g, vars.score != null ? String(vars.score) : '');
}

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Get a single line of dialogue for the active companion reacting to a trigger.
 * Falls back to a generic line, then to home_greeting, so it never throws.
 */
export function getLine(
  companionId: CompanionId,
  trigger: TriggerKey,
  vars: DialogueVars = {},
): string {
  const bank = BANKS[companionId];
  const lines = bank[trigger] ?? FALLBACK[trigger] ?? FALLBACK.home_greeting!;
  return fill(pick(lines), vars);
}
