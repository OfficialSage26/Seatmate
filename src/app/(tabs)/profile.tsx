import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { COMPANIONS, getCompanion } from '@/companions/companions';
import { Alpha, FloatingTabBarSpace, Spacing, softShadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/store/profile';

const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  nonbinary: 'Non-binary',
  unspecified: 'Prefer not to say',
};

function formatBirthday(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile)!;
  const changeCompanion = useProfileStore((s) => s.changeCompanion);
  const current = getCompanion(profile.companionId);
  const birthday = formatBirthday(profile.birthday);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle">Profile</ThemedText>

          {/* Identity card */}
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }, softShadow]}>
            <View style={[styles.avatar, { backgroundColor: current.color + Alpha.soft }]}>
              <ThemedText style={styles.emoji}>{current.emoji}</ThemedText>
            </View>
            <View style={styles.flex}>
              <ThemedText type="default" style={{ fontWeight: '700' }}>
                {profile.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {profile.gradeLevel} · Age {profile.age}
              </ThemedText>
              {birthday && (
                <ThemedText type="small" themeColor="textSecondary">
                  <Ionicons name="gift-outline" size={12} color={theme.textSecondary} /> {birthday}
                </ThemedText>
              )}
              <ThemedText type="small" style={{ color: current.color, marginTop: 2 }}>
                Seatmate: {current.name}
                {GENDER_LABELS[profile.gender] ? ` · ${GENDER_LABELS[profile.gender]}` : ''}
              </ThemedText>
            </View>
          </View>

          {/* Companion switcher */}
          <ThemedText type="smallBold" style={{ marginTop: Spacing.two }}>
            Change companion
          </ThemedText>
          <View style={styles.companionGrid}>
            {COMPANIONS.map((c) => {
              const selected = c.id === profile.companionId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => changeCompanion(c.id)}
                  style={[
                    styles.miniCard,
                    { backgroundColor: theme.backgroundElement, borderColor: selected ? c.color : 'transparent' },
                  ]}>
                  <View style={[styles.miniAvatar, { backgroundColor: c.color + Alpha.soft }]}>
                    <ThemedText style={styles.miniEmoji}>{c.emoji}</ThemedText>
                  </View>
                  <ThemedText type="small" style={{ fontWeight: selected ? '700' : '500' }}>
                    {c.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Settings entry */}
          <Pressable
            onPress={() => router.push('/settings')}
            style={[styles.settingsRow, { backgroundColor: theme.backgroundElement }]}>
            <View style={[styles.settingsIcon, { backgroundColor: theme.background }]}>
              <Ionicons name="settings-outline" size={20} color={theme.text} />
            </View>
            <ThemedText type="default" style={[styles.flex, { fontWeight: '600' }]}>
              Settings
            </ThemedText>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  content: { gap: Spacing.three, paddingBottom: FloatingTabBarSpace },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: Spacing.four, padding: Spacing.four },
  avatar: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 36 },
  flex: { flex: 1, gap: 2 },
  companionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  miniCard: {
    width: '31%',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 2,
  },
  miniAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  miniEmoji: { fontSize: 24 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    marginTop: Spacing.two,
  },
  settingsIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
