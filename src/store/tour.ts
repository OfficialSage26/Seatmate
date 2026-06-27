/**
 * Drives the interactive walkthrough. A single overlay (TutorialOverlay) reads
 * this store, spotlights the current step's on-screen target, and shows Ella's
 * instruction. The store only holds progress + the measured target rect; the
 * overlay does the navigating and measuring.
 */

import type { Href } from 'expo-router';
import { create } from 'zustand';

export type TourRect = { x: number; y: number; width: number; height: number };

export type TourStep = {
  /** Registry id of the element to spotlight (see useTourTarget). */
  target: string;
  /** Tab to navigate to so the target is on screen. */
  route: Href;
  title: string;
  /** Ella's one-line instruction for this step. */
  line: string;
};

/**
 * The script. Each tab is introduced, then its primary action is pointed out,
 * so the tour mirrors the real flow of using the app.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    target: 'tab-home',
    route: '/(tabs)',
    title: 'Home',
    line: 'Dito ang dashboard mo. Makikita mo ang streak, ang progress mo ngayong linggo, at kung anong quiz ang malapit na.',
  },
  {
    target: 'tab-subjects',
    route: '/subjects',
    title: 'Subjects',
    line: 'I-tap ang Subjects tab para sa mga klase mo.',
  },
  {
    target: 'subjects-add',
    route: '/subjects',
    title: 'Magdagdag ng subject',
    line: 'Pindutin ang + Add para magdagdag ng subject. May sariling kulay bawat isa para mabilis hanapin.',
  },
  {
    target: 'tab-quizzes',
    route: '/quizzes',
    title: 'Quizzes',
    line: 'Dito naman ang mga quiz at exam mo.',
  },
  {
    target: 'quizzes-add',
    route: '/quizzes',
    title: 'Magdagdag ng quiz',
    line: 'Pindutin ang + Quiz para mag-log, lagyan ng petsa, tapos i-record mo ang score pagkatapos.',
  },
  {
    target: 'tab-notes',
    route: '/notes',
    title: 'Notes',
    line: 'Para sa study notes mo. Naka-save lahat dito sa device, gagana kahit offline.',
  },
  {
    target: 'notes-add',
    route: '/notes',
    title: 'Bagong note',
    line: 'Pindutin ang + para magsulat ng bagong note.',
  },
  {
    target: 'tab-settings',
    route: '/profile',
    title: 'Settings',
    line: 'Dito mo mababago ang itsura ng app at ma-manage ang data mo. Ayan, yun lang! Tara na.',
  },
];

type TourState = {
  active: boolean;
  index: number;
  rect: TourRect | null;
  start: () => void;
  stop: () => void;
  next: () => void;
  back: () => void;
  setRect: (rect: TourRect | null) => void;
};

export const useTourStore = create<TourState>((set, get) => ({
  active: false,
  index: 0,
  rect: null,
  start: () => set({ active: true, index: 0, rect: null }),
  stop: () => set({ active: false, rect: null }),
  next: () => {
    const { index } = get();
    if (index >= TOUR_STEPS.length - 1) {
      set({ active: false, rect: null });
      return;
    }
    set({ index: index + 1, rect: null });
  },
  back: () => {
    const { index } = get();
    if (index <= 0) return;
    set({ index: index - 1, rect: null });
  },
  setRect: (rect) => set({ rect }),
}));
