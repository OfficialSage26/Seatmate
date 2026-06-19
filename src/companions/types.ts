/** Types for the companion system. */

import type { ImageSourcePropType } from 'react-native';

export type Gender = 'male' | 'female';

/**
 * For the first release we ship a single companion, Ella. The id union and the
 * registry below stay list-shaped so more companions can be added later without
 * reworking the call sites.
 */
export type CompanionId = 'ella';

export type Companion = {
  id: CompanionId;
  name: string;
  gender: Gender;
  /** Emoji stand-in, kept as a last-resort fallback if art fails to load. */
  emoji: string;
  /** Waist-up character art (welcoming pose) — used for the hero on onboarding
   * and as the figure everywhere else. */
  waistUp: ImageSourcePropType;
  /** Full-body character art (transparent) — used large on the dashboard and
   * as the figure on each onboarding question. */
  fullBody: ImageSourcePropType;
  /** Full-body cheering pose — used for the "all set" send-off on onboarding. */
  cheerful: ImageSourcePropType;
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
  | 'onboarding_intro' // Ella introducing herself at the start of onboarding
  | 'onboarding_ready' // Ella's send-off at the end of onboarding
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
