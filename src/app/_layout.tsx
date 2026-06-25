import {
  DarkTheme as NavDark,
  DefaultTheme as NavLight,
  ThemeProvider,
  type Theme,
} from '@react-navigation/native';
import { useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { NunitoFonts } from '@/constants/fonts';
import { Colors } from '@/constants/theme';
import { initDatabase } from '@/db/client';
import { useResolvedScheme } from '@/hooks/use-resolved-scheme';
import { useProfileStore } from '@/store/profile';
import { useSettingsStore } from '@/store/settings';

// Hold the native splash until fonts + data are ready so the first frame is
// already styled (no flash of a fallback system font).
SplashScreen.preventAutoHideAsync();

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
  const [fontsLoaded, fontError] = useFonts(NunitoFonts);

  useEffect(() => {
    // Set up the local database, then load saved profile + settings into memory.
    initDatabase();
    hydrateSettings();
    hydrateProfile();
    setReady(true);
  }, [hydrateProfile, hydrateSettings]);

  const booted = ready && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (booted) SplashScreen.hideAsync();
  }, [booted]);

  if (!booted) return null; // splash stays up; DB init + hydration are synchronous

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider value={scheme === 'dark' ? darkNav : lightNav}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
