import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCompanion } from '@/companions/companions';
import { getLine } from '@/companions/dialogue';
import type { TriggerKey } from '@/companions/types';
import { Alpha, FloatingTabBarSpace, Spacing, softShadow } from '@/constants/theme';
import { countSubjects } from '@/db/repositories/subjects';
import { countTakenQuizzes, listUpcomingQuizzes } from '@/db/repositories/quizzes';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/store/profile';

function greetingTrigger(): TriggerKey {
  const h = new Date().getHours();
  if (h < 12) return 'home_morning';
  if (h >= 18) return 'home_evening';
  return 'home_greeting';
}

export default function HomeScreen() {
  const theme = useTheme();
  const { height } = useWindowDimensions();
  const figureH = Math.min(Math.round(height * 0.42), 380);
  const profile = useProfileStore((s) => s.profile)!;
  const companion = getCompanion(profile.companionId);

  const [upcoming, setUpcoming] = useState(0);
  const [subjects, setSubjects] = useState(0);
  const [taken, setTaken] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setUpcoming(listUpcomingQuizzes().length);
      setSubjects(countSubjects());
      setTaken(countTakenQuizzes());
    }, []),
  );

  const greeting = useMemo(
    () =>
      getLine(profile.companionId, upcoming === 0 ? 'empty_quizzes' : greetingTrigger(), {
        name: profile.name,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile.companionId, profile.name, upcoming === 0],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="small" themeColor="textSecondary">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </ThemedText>

          {/* Companion — the emotional centerpiece */}
          <View style={styles.companionBlock}>
            <View style={[styles.glow, { backgroundColor: companion.color + Alpha.soft, width: figureH, height: figureH, borderRadius: figureH / 2 }]} />
            <Image
              source={companion.fullBody}
              style={{ width: Math.round(figureH * 0.384), height: figureH }}
              resizeMode="contain"
            />
            <View style={[styles.bubble, { backgroundColor: theme.backgroundElement }, softShadow]}>
              <ThemedText type="smallBold" style={{ color: companion.color }}>
                {companion.name}
              </ThemedText>
              <ThemedText type="default">{greeting}</ThemedText>
            </View>
          </View>

          {/* At-a-glance stats */}
          <View style={styles.statsRow}>
            <StatCard label="Upcoming quizzes" value={upcoming} theme={theme} />
            <StatCard label="Subjects" value={subjects} theme={theme} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Quizzes taken" value={taken} theme={theme} />
            <View style={styles.flex} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function StatCard({
  label,
  value,
  theme,
}: {
  label: string;
  value: number;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four, paddingBottom: FloatingTabBarSpace },
  companionBlock: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two },
  glow: {
    position: 'absolute',
    bottom: 24,
    opacity: 0.5,
  },
  bubble: {
    alignSelf: 'stretch',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.three },
  flex: { flex: 1 },
  statCard: {
    flex: 1,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  statValue: { fontSize: 40, lineHeight: 44 },
});
