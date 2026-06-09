/** Types for the companion system. */

export type Gender = 'male' | 'female';

export type CompanionId = 'juan' | 'marco' | 'renz' | 'stacy' | 'bea' | 'ella';

export type Companion = {
  id: CompanionId;
  name: string;
  gender: Gender;
  /** Emoji stand-in for real character art (swapped in later). */
  emoji: string;
  /** Accent color used on the companion's cards/buttons. */
  color: string;
  /** One-line personality hook shown on the picker. */
  tagline: string;
  /** A couple sentences describing the personality. */
  blurb: string;
};

/**
 * Every situation the companion can react to. Add a key here, then add lines
 * for it in each companion's dialogue bank. The engine picks a random line for
 * the active companion + trigger.
 */
export type TriggerKey =
  | 'companion_selected' // right after you pick them in onboarding
  | 'home_greeting' // generic line on the home screen
  | 'home_morning' // home screen, before noon
  | 'home_evening' // home screen, after 6pm
  | 'empty_quizzes' // no quizzes tracked yet
  | 'quiz_added' // you just added a quiz
  | 'surprise_quiz' // you logged a surprise/pop quiz
  | 'quiz_due_soon' // a quiz is within ~2 days
  | 'quiz_scored_high' // you logged a score >= 85%
  | 'quiz_scored_mid' // 60–84%
  | 'quiz_scored_low'; // < 60%

/** A companion's lines, grouped by trigger. */
export type DialogueBank = Partial<Record<TriggerKey, string[]>>;

/**
 * Values that can be interpolated into a line, e.g. "Nice one {name}!".
 * Unused placeholders are simply left blank.
 */
export type DialogueVars = {
  name?: string;
  subject?: string;
  score?: number | string;
};
