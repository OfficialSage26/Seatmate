import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alpha, Spacing } from '@/constants/theme';
import { resetAllData } from '@/db/client';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/store/profile';
import { useSettingsStore } from '@/store/settings';

const THEME_LABELS = { system: 'System', light: 'Light', dark: 'Dark' } as const;

export default function SettingsIndex() {
  const theme = useTheme();
  const router = useRouter();
  const themePref = useSettingsStore((s) => s.themePref);

  function confirmReset() {
    // Step 1: warn.
    Alert.alert(
      'Reset all data?',
      'This permanently deletes your profile, subjects, and quizzes from this device. This cannot be undone.',
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.group, { backgroundColor: theme.backgroundElement }]}>
          <Row
            icon="🎨"
            label="Appearance"
            value={THEME_LABELS[themePref]}
            theme={theme}
            onPress={() => router.push('/settings/appearance')}
          />
          <Divider theme={theme} />
          <Row icon="ℹ️" label="About" theme={theme} onPress={() => router.push('/settings/about')} />
        </View>

        <View style={[styles.group, { backgroundColor: theme.backgroundElement }]}>
          <Row icon="🗑️" label="Reset data" danger theme={theme} onPress={confirmReset} />
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Seatmate keeps everything on this device. Nothing is uploaded.
        </ThemedText>
      </ScrollView>
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
  icon: string;
  label: string;
  value?: string;
  danger?: boolean;
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: theme.background }]}>
        <ThemedText style={styles.icon}>{icon}</ThemedText>
      </View>
      <ThemedText type="default" style={[styles.flex, { color: danger ? theme.danger : theme.text, fontWeight: '600' }]}>
        {label}
      </ThemedText>
      {value && (
        <ThemedText type="small" themeColor="textSecondary">
          {value}
        </ThemedText>
      )}
      {!danger && (
        <ThemedText type="default" themeColor="textSecondary">
          ›
        </ThemedText>
      )}
    </Pressable>
  );
}

function Divider({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  group: { borderRadius: Spacing.four, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18 },
  flex: { flex: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  footer: { textAlign: 'center', paddingHorizontal: Spacing.four, marginTop: Spacing.two },
});
