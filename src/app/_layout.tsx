import {
  DarkTheme as NavDark,
  DefaultTheme as NavLight,
  ThemeProvider,
  type Theme,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { Colors } from '@/constants/theme';
import { initDatabase } from '@/db/client';
import { useResolvedScheme } from '@/hooks/use-resolved-scheme';
import { useProfileStore } from '@/store/profile';
import { useSettingsStore } from '@/store/settings';

/** Navigation themes wired to our own palette so screen backgrounds match. */
const lightNav: Theme = {
  ...NavLight,
  colors: { ...NavLight.colors, background: Colors.light.background, card: Colors.light.background, text: Colors.light.text, border: Colors.light.border },
};
const darkNav: Theme = {
  ...NavDark,
  colors: { ...NavDark.colors, background: Colors.dark.background, card: Colors.dark.background, text: Colors.dark.text, border: Colors.dark.border },
};

export default function RootLayout() {
  const hydrateProfile = useProfileStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);
  const scheme = useResolvedScheme();

  useEffect(() => {
    // Set up the local database, then load saved profile + settings into memory.
    initDatabase();
    hydrateSettings();
    hydrateProfile();
    setReady(true);
  }, [hydrateProfile, hydrateSettings]);

  if (!ready) return null; // brief: DB init + hydration are synchronous

  return (
    <ThemeProvider value={scheme === 'dark' ? darkNav : lightNav}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
      </Stack>
    </ThemeProvider>
  );
}
