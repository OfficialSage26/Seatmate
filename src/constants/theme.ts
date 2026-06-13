/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11131A',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
    backgroundElement: '#F4F5F7', // cards / inputs
    backgroundSelected: '#E6E8EC',
    border: '#E6E8EC',
    danger: '#E5484D',
    success: '#30A46C',
  },
  dark: {
    text: '#F5F6F8',
    textSecondary: '#9BA1AC',
    background: '#0B0C10', // soft near-black, not harsh #000
    backgroundElement: '#16181D',
    backgroundSelected: '#24262E',
    border: '#24262E',
    danger: '#FF6369',
    success: '#3DD68C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Seatmate brand colors (same blue as the splash screen). */
export const Brand = {
  primary: '#208AEF',
  primaryDark: '#1769C9',
  onPrimary: '#ffffff',
} as const;

/**
 * Brand color at low opacity — for soft category backgrounds and subtle
 * highlights (the 5% accent from the 60/30/10 rule). Append to any hex color.
 */
export const Alpha = {
  soft: '22', // ~13%
  faint: '14', // ~8%
} as const;

/** A soft, theme-tinted shadow preset (never harsh gray/black). */
export const softShadow = {
  shadowColor: '#0B1220',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * Vertical space a scroll view should leave at the bottom so its last items
 * clear the floating bottom navbar (bar height + its raised FAB + margin).
 * Add this to a screen's scroll `contentContainerStyle.paddingBottom`.
 */
export const FloatingTabBarSpace = 136;
