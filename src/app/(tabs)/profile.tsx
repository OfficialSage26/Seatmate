import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FloatingTabBarSpace, Spacing } from '@/constants/theme';
import { resetAllData } from '@/db/client';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/store/profile';
import { useSettingsStore } from '@/store/settings';
import { useTourStore } from '@/store/tour';

const THEME_LABELS = { system: 'System', light: 'Light', dark: 'Dark' } as const;

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const themePref = useSettingsStore((s) => s.themePref);
  const startTour = useTourStore((s) => s.start);

  function confirmReset() {
    // Step 1: warn.
    Alert.alert(
      'Erase all data?',
      'This permanently deletes your profile, subjects, quizzes, and notes from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () =>
            // Step 2: final confirmation (the "permission" gate).
            Alert.alert('Are you absolutely sure?', 'Everything will be erased and you\'ll start onboarding again.', [
              { text: 'Keep my data', style: 'cancel' },
              {
                text: 'Erase everything',
                style: 'destructive',
                onPress: () => {
                  resetAllData();
                  useProfileStore.setState({ profile: null });
                  useSettingsStore.setState({ themePref: 'system' });
                  router.replace('/onboarding');
                },
              },
            ]),
        },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle">Settings</ThemedText>

          {/* Preferences */}
          <View style={[styles.group, { backgroundColor: theme.backgroundElement }]}>
            <Row
              icon="color-palette-outline"
              label="Appearance"
              value={THEME_LABELS[themePref]}
              theme={theme}
              onPress={() => router.push('/settings/appearance')}
            />
            <Divider theme={theme} />
            <Row
              icon="school-outline"
              label="How to use Seatmate"
              theme={theme}
              onPress={startTour}
            />
            <Divider theme={theme} />
            <Row
              icon="information-circle-outline"
              label="About"
              theme={theme}
              onPress={() => router.push('/settings/about')}
            />
            <Divider theme={theme} />
            <Row
              icon="ribbon-outline"
              label="Credits"
              theme={theme}
              onPress={() => router.push('/settings/credits')}
            />
          </View>

          {/* Danger zone */}
          <View style={[styles.group, { backgroundColor: theme.backgroundElement }]}>
            <Row icon="trash-outline" label="Erase all data" danger theme={theme} onPress={confirmReset} />
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
            Seatmate keeps everything on this device. Nothing is uploaded.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Row({
  icon,
  label,
  value,
  danger,
  theme,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  danger?: boolean;
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={18} color={danger ? theme.danger : theme.text} />
      </View>
      <ThemedText type="default" style={[styles.flex, { color: danger ? theme.danger : theme.text, fontWeight: '600' }]}>
        {label}
      </ThemedText>
      {value && (
        <ThemedText type="small" themeColor="textSecondary">
          {value}
        </ThemedText>
      )}
      {!danger && <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
    </Pressable>
  );
}

function Divider({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  content: { gap: Spacing.three, paddingBottom: FloatingTabBarSpace },
  flex: { flex: 1 },
  group: { borderRadius: Spacing.four, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  footer: { textAlign: 'center', marginTop: Spacing.two },
});
