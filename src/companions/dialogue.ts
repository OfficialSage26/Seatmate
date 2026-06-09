/**
 * The dialogue engine — this is what makes Seatmate feel like a companion
 * instead of a planner, and it runs 100% offline with no AI.
 *
 * Each companion has a bank of pre-written lines grouped by `TriggerKey`. When
 * something happens in the app (a quiz is added, a score is logged, the home
 * screen opens), `getLine()` picks a random line for the active companion and
 * that trigger, and fills in any {placeholders}.
 *
 * To give a companion more personality, just add more lines here. Juan and
 * Marco are written out fully as the reference examples; the others have a
 * starter set you can expand.
 */

import type { CompanionId, DialogueBank, DialogueVars, TriggerKey } from './types';

const BANKS: Record<CompanionId, DialogueBank> = {
  // ── Juan: funny, mischievous, street-smart ───────────────────────────────
  juan: {
    companion_selected: [
      'Ayt {name}, you and me to the back row. Let\'s gooo. 😎',
      'Good choice. I don\'t study much but I never let a friend fail. Deal?',
    ],
    home_greeting: [
      'Uy {name}! Wala ka bang ginagawa? Joke — anong agenda natin? 😏',
      'Present! Barely. What are we tracking today?',
      'Boss {name}, anong lakad? Acads daw? Sige sige.',
    ],
    home_morning: [
      'Morning {name}. Kape muna bago acads, char. Tara, plan tayo.',
      'Aga mo ah. Sige, impressed ako. Let\'s see the day.',
    ],
    home_evening: [
      'Gabi na {name}. Konting review na lang, tapos rest ka na ha.',
      'Tapusin natin \'to mabilis para may gaming time pa. 😎',
    ],
    empty_quizzes: [
      'Wala pang quiz dito... suspicious. You sure di mo lang nakakalimutan? 👀',
      'Clean slate! Or amnesia. Add mo na yung mga quiz para alam natin.',
    ],
    quiz_added: [
      'Noted ko na yang {subject}. Ako bahala mag-remind, di tulad sa\'yo. 😏',
      'Okay okay, {subject} quiz. We got this, I\'ll carry the vibes, ikaw the brains.',
    ],
    surprise_quiz: [
      'SURPRISE QUIZ?! Grabe naman si teacher oh. Bawi tayo, {name}. 😅',
      'Ambush sa {subject}! Basta wag panic, kaya natin \'to. 😎',
    ],
    quiz_due_soon: [
      'Psst {name}, malapit na yung {subject} quiz. Tara aral, sandali lang naman.',
      'Heads up — {subject} is coming up. Cram tayo ng tama, hindi panic.',
    ],
    quiz_scored_high: [
      'GRABE {score}?! Sino nag-aral, ikaw o ako? 😂 Proud ako, {name}.',
      'Yieee {score}! Sabi na nga ba may utak ka pala sa likod ng katamaran.',
    ],
    quiz_scored_mid: [
      '{score}. Pasado, pwede na! Pero alam nating kaya mo pa higit dyan.',
      'Hindi masama, {name}. Next time angatan natin ng konti, oks?',
    ],
    quiz_scored_low: [
      'Oof {score}. Okay lang yan {name}, isang quiz lang yan. Bangon tayo.',
      'Hindi natin to iiyakan. Tutulungan kita next time, promise. 💪',
    ],
  },

  // ── Marco: disciplined, academic, high standards ─────────────────────────
  marco: {
    companion_selected: [
      'Good. Discipline beats talent, {name}. Let\'s build a real routine.',
      'I\'ll keep you accountable. Show up consistently and the grades follow.',
    ],
    home_greeting: [
      'Let\'s be productive today, {name}. What\'s the priority?',
      'Focus first, distractions later. What are we working on?',
      'A clear plan beats a busy day. Walk me through it.',
    ],
    home_morning: [
      'Early start, {name}. This is exactly how top students operate.',
      'Morning. Tackle the hardest task first while your mind is fresh.',
    ],
    home_evening: [
      'Wind down with a short review, {name}. Sleep is part of studying.',
      'Close the day by checking tomorrow\'s schedule. Prepared, not surprised.',
    ],
    empty_quizzes: [
      'No quizzes logged. Track them now — you can\'t prepare for what you don\'t see.',
      'Start by adding your assessments. Visibility is the first step to control.',
    ],
    quiz_added: [
      'Logged {subject}. Now schedule study time for it before it\'s urgent.',
      '{subject} noted. Spaced practice beats last-minute cramming. Plan ahead.',
    ],
    surprise_quiz: [
      'A surprise quiz on {subject}. This is why we review daily, {name}. Logged.',
      'Pop quiz noted. Preparedness removes surprise — let\'s build that habit.',
    ],
    quiz_due_soon: [
      '{subject} is approaching. Review today, lightly tomorrow. Don\'t cram.',
      'Two quiet sessions now will beat one panicked night, {name}. Start.',
    ],
    quiz_scored_high: [
      'Excellent. {score} is the standard I expect from you. Sustain it. 📈',
      '{score}. Strong work, {name}. Now protect this momentum.',
    ],
    quiz_scored_mid: [
      '{score}. Acceptable, but below your ceiling. Let\'s find the gaps.',
      'A {score} tells us where to focus. Review the misses — that\'s the lesson.',
    ],
    quiz_scored_low: [
      '{score}. Disappointing, but useful data. We adjust the method, not the effort.',
      'One result, {name}. Identify what went wrong and we fix the system.',
    ],
  },

  // ── Renz: gamer, quests & XP ─────────────────────────────────────────────
  renz: {
    companion_selected: [
      'Player 2 selected: {name}. Co-op campaign begins now. 🎮',
      'New party member! Our quest: clear every exam. Let\'s grind.',
    ],
    home_greeting: [
      'Quest log open, {name}. What\'s today\'s mission?',
      'Loading dashboard... ready when you are. 🎮',
    ],
    empty_quizzes: ['No active quests. Add a quiz to start the campaign, {name}.'],
    quiz_added: ['New quest accepted: {subject}. Reward on completion: +XP and bragging rights.'],
    surprise_quiz: [
      'AMBUSH EVENT: {subject} pop quiz! Random encounter logged. ⚔️',
      'Surprise boss appeared — no save point! We adapt, {name}. 🎮',
    ],
    quiz_due_soon: ['⚠️ Boss incoming: {subject} quiz. Time to grind your stats, {name}.'],
    quiz_scored_high: ['QUEST COMPLETE — {score}! Achievement unlocked. 🏆 GG {name}.'],
    quiz_scored_mid: ['Quest cleared: {score}. Solid run. Replay for the high score?'],
    quiz_scored_low: ['Game over... this round. Respawn and retry, {name}. Every pro wipes sometimes.'],
  },

  // ── Stacy: strict but caring leader ──────────────────────────────────────
  stacy: {
    companion_selected: [
      'Alright {name}, I\'ll keep you on track — because I know you can do this.',
      'I\'m tough because I care. Let\'s stay responsible together.',
    ],
    home_greeting: ['Let\'s stay on top of things, {name}. What needs doing?'],
    empty_quizzes: ['No quizzes here yet. Add them so nothing slips, okay?'],
    quiz_added: ['Got it — {subject}. I\'ll make sure you don\'t forget it.'],
    surprise_quiz: [
      'A surprise quiz?! This is exactly why we stay ready, {name}. Logged it.',
      'No warning on {subject}? Doesn\'t matter — prepared students don\'t panic.',
    ],
    quiz_due_soon: ['{subject} is almost here, {name}. Don\'t leave it to the last minute.'],
    quiz_scored_high: ['{score}! See? Responsibility pays off. Keep it up. 👏'],
    quiz_scored_mid: ['{score}. Decent — but I\'ve seen you do better. Let\'s aim higher.'],
    quiz_scored_low: ['{score}. We don\'t panic, we plan. I\'ll help you turn this around.'],
  },

  // ── Bea: cheerful, clingy, supportive ────────────────────────────────────
  bea: {
    companion_selected: [
      'YAY you picked me {name}!! 🥹💛 I\'m gonna be your biggest fan!',
      'Bestie energy activated! We\'re gonna do amazing things together!',
    ],
    home_greeting: ['Hi hi {name}!! 💛 So happy you\'re here! What are we doing?'],
    empty_quizzes: ['Ooh a fresh start! Add your quizzes and I\'ll cheer you through them!'],
    quiz_added: ['Yay, {subject} added! We\'ve got this, I believe in you so much!! 💪'],
    surprise_quiz: [
      'OMG a surprise quiz on {subject}?! Don\'t worry {name}, I\'m right here!! 🫶',
      'Eeek pop quiz!! Deep breath — you\'ve got this, I believe in you!! 💛',
    ],
    quiz_due_soon: ['Eep! {subject} is coming up soon — let\'s study a lil, you got this!!'],
    quiz_scored_high: ['OMG {score}?!! I KNEW IT! So so SO proud of you {name}!! 🥹💛'],
    quiz_scored_mid: ['{score}! That\'s good {name}! Tiny push next time and you\'ll shine ✨'],
    quiz_scored_low: ['Aww {score} — it\'s okay {name}, I\'m right here. We\'ll bounce back together 🫂'],
  },

  // ── Ella: calm, gentle, encouraging ──────────────────────────────────────
  ella: {
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
