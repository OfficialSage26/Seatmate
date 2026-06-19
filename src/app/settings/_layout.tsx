import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function SettingsLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Screen name="appearance" options={{ title: 'Appearance' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
      <Stack.Screen name="credits" options={{ title: 'Credits' }} />
    </Stack>
  );
}
