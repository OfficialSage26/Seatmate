import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCompanion } from '@/companions/companions';
import { getLine } from '@/companions/dialogue';
import type { TriggerKey } from '@/companions/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { todayISO } from '@/constants/academic';
import { Alpha, Brand, FloatingTabBarSpace, softShadow, Spacing } from '@/constants/theme';
import { getStreak, getWeekActivity, getWeekDelta, type WeekBar } from '@/db/repositories/activity';
import { countNotes } from '@/db/repositories/notes';
import { countTakenQuizzes, listUpcomingQuizzes } from '@/db/repositories/quizzes';
import { countSubjects } from '@/db/repositories/subjects';
import type { Quiz } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/store/profile';

// Accent colors from the design that aren't part of the theme palette.
const STREAK = '#F2994A';
const GREEN = '#27AE60';
const PURPLE = '#9B51E0';

// Layout: a comfortable reading column so phones get the full width while
// tablets, foldables and web don't stretch the content edge to edge.
const H_PADDING = 18;
const MAX_COLUMN = 520;

function greetingTrigger(): TriggerKey {
  const h = new Date().getHours();
  if (h < 12) return 'home_morning';
  if (h >= 18) return 'home_evening';
  return 'home_greeting';
}

function greetingTitle(name: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Magandang umaga, ${name}`;
  if (h >= 18) return `Magandang gabi, ${name}`;
  return `Magandang hapon, ${name}`;
}

// Tagalog weekday initials (Linggo, Lunes, Martes, Miyerkoles, Huwebes,
// Biyernes, Sabado), indexed by Date.getDay() — matches the design's L M M H B S L.
const TAGALOG_INITIALS = ['L', 'L', 'M', 'M', 'H', 'B', 'S'];
function tagalogInitial(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  return TAGALOG_INITIALS[new Date(y, m - 1, d).getDay()];
}

const TL_DAYS = ['Linggo', 'Lunes', 'Martes', 'Miyerkoles', 'Huwebes', 'Biyernes', 'Sabado'];
const TL_MONTHS = ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'];
function tagalogDate(): string {
  const d = new Date();
  return `${TL_DAYS[d.getDay()]}, ${TL_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Whole days from today (local) until an ISO date; negative if past. */
function daysUntil(dateISO: string): number {
  const [y, m, d] = dateISO.split('-').map(Number);
  const [ty, tm, td] = todayISO().split('-').map(Number);
  return Math.round((new Date(y, m - 1, d).getTime() - new Date(ty, tm - 1, td).getTime()) / 86_400_000);
}

function dueLabel(n: number): { big: string; small: string } {
  if (n <= 0) return { big: '!', small: 'today' };
  if (n === 1) return { big: '1', small: 'day' };
  return { big: String(n), small: 'days' };
}

// Full-body art aspect ratio (width / height) for clip-to-bust sizing.
const FULL_RATIO = 430 / 1120;

// Fraction of the full-body image kept by the top-anchored crop window. ~0.5
// stops just below Ella's ID lanyard (raise/lower this to move the cut line).
const CROP_BELOW_ID = 0.5;

// How far Ella is dropped from the top of the hero block. Shared by her figure
// and the block's height so the left column (and the week card) reach her bottom.
const ELLA_TOP = 14;

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const profile = useProfileStore((s) => s.profile)!;
  const companion = getCompanion(profile.companionId);

  // Everything is sized off the capped column width (not the raw window), so
  // the art and cards stay proportional from small phones to tablets.
  const frameW = Math.min(width, MAX_COLUMN) - H_PADDING * 2;

  // Ella lives big on the right: a full-body image rendered wide, then clipped
  // by its container so she shows head-to-mid-skirt. Only the bottom clips — the
  // container is as wide as the image so her hair never gets a hard side cut.
  const figW = Math.round(frameW * 0.46);
  const imgW = Math.round(frameW * 0.56);
  const imgH = Math.round(imgW / FULL_RATIO);
  const figH = Math.round(imgH * CROP_BELOW_ID);

  // Keep the week card narrow enough that its right edge clears Ella's arm/book
  // on the right instead of overlapping her.
  const weekCardW = Math.round(frameW * 0.48);

  const [upcoming, setUpcoming] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState(0);
  const [taken, setTaken] = useState(0);
  const [notes, setNotes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [week, setWeek] = useState<WeekBar[]>([]);
  const [delta, setDelta] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      setUpcoming(listUpcomingQuizzes());
      setSubjects(countSubjects());
      setTaken(countTakenQuizzes());
      setNotes(countNotes());
      setStreak(getStreak());
      setWeek(getWeekActivity());
      setDelta(getWeekDelta());
    }, []),
  );

  const hasData = subjects > 0 || taken > 0 || notes > 0 || upcoming.length > 0;
  const nextUp = upcoming[0];

  const ellaLine = useMemo(
    () =>
      getLine(profile.companionId, hasData ? greetingTrigger() : 'empty_quizzes', { name: profile.name }),
    [profile.companionId, profile.name, hasData],
  );

  const dateLine = tagalogDate();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.column}>
            {/* top row: date · streak · bell */}
            <View style={styles.topRow}>
              <ThemedText type="small" themeColor="textSecondary" style={{ fontWeight: '700', fontSize: 12.5 }}>
                {dateLine}
              </ThemedText>
              <View style={styles.topRight}>
                <View style={[styles.streakChip, { backgroundColor: STREAK + Alpha.soft }]}>
                  <Ionicons name="flame" size={13} color={STREAK} />
                  <ThemedText type="smallBold" style={{ color: STREAK }}>
                    {streak}
                  </ThemedText>
                </View>
                <View style={[styles.bell, { backgroundColor: theme.backgroundElement }]}>
                  <Ionicons name="notifications-outline" size={17} color={theme.text} />
                  <View style={[styles.bellDot, { backgroundColor: GREEN, borderColor: theme.backgroundElement }]} />
                </View>
              </View>
            </View>

            {/* Ella living in the dashboard: text on the left, waist-up on the
                right. Container is exactly as wide as the image so only the
                BOTTOM clips (head-to-hips bust); clipping the sides would leave a
                hard vertical cut through her hair. */}
            <View style={[styles.ellaBlock, { minHeight: figH + ELLA_TOP }]}>
              <View style={[styles.ellaFigure, { width: imgW, height: figH, top: ELLA_TOP }]} pointerEvents="none">
                <View
                  style={[
                    styles.glow,
                    { backgroundColor: companion.color, width: figW + 8, height: figW + 8, borderRadius: (figW + 8) / 2 },
                  ]}
                />
                <Image source={companion.fullBody} style={{ width: imgW, height: imgH }} resizeMode="contain" />
              </View>
              <View style={styles.ellaText}>
                <ThemedText style={styles.greeting}>{greetingTitle(profile.name)}</ThemedText>
                <View style={{ marginTop: Spacing.three }}>
                  <ThemedText type="smallBold" style={{ color: GREEN }}>
                    {companion.name}
                  </ThemedText>
                  <ThemedText type="small" style={[styles.ellaLine, { color: theme.text }]}>
                    {ellaLine}
                  </ThemedText>
                </View>

                <WeekGraph week={week} delta={delta} theme={theme} width={weekCardW} />
              </View>
            </View>

            {/* Next up */}
            {nextUp && (
              <>
                <View style={styles.sectionHead}>
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Next up
                  </ThemedText>
                  <Pressable onPress={() => router.push('/quizzes')}>
                    <ThemedText type="smallBold" style={{ color: Brand.primary }}>
                      See all
                    </ThemedText>
                  </Pressable>
                </View>
                <View style={[styles.nextCard, { backgroundColor: theme.backgroundElement }, softShadow]}>
                  <View style={[styles.nextAccent, { backgroundColor: STREAK }]} />
                  <View style={styles.nextTopRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.nextTitle}>
                        {nextUp.subject ? `${nextUp.subject} — ${nextUp.title}` : nextUp.title}
                      </ThemedText>
                      {nextUp.maxScore > 0 && (
                        <ThemedText type="small" themeColor="textSecondary" style={{ fontWeight: '700', marginTop: 3 }}>
                          {nextUp.maxScore} items
                        </ThemedText>
                      )}
                      <ThemedText type="small" style={{ color: GREEN, fontWeight: '700', marginTop: 9, lineHeight: 18 }}>
                        {getLine(profile.companionId, 'quiz_due_soon', { name: profile.name })}
                      </ThemedText>
                    </View>
                    <View style={[styles.daysBadge, { backgroundColor: STREAK + Alpha.soft }]}>
                      <ThemedText style={{ fontSize: 21, fontWeight: '900', color: STREAK, lineHeight: 22 }}>
                        {dueLabel(daysUntil(nextUp.date)).big}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 10.5, fontWeight: '800', color: STREAK }}>
                        {dueLabel(daysUntil(nextUp.date)).small}
                      </ThemedText>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => router.push('/quizzes')}
                    style={[styles.reviewBtn, { backgroundColor: Brand.primary }]}>
                    <ThemedText type="smallBold" style={{ color: Brand.onPrimary, fontSize: 14 }}>
                      Mag-review
                    </ThemedText>
                  </Pressable>
                </View>
              </>
            )}

            {/* Your week stats */}
            <ThemedText type="smallBold" style={[styles.sectionTitle, { marginTop: 22, marginBottom: 11 }]}>
              Your week
            </ThemedText>
            <View style={styles.statsGrid}>
              <StatCard icon="calendar-outline" tint={Brand.primary} value={upcoming.length} label="Upcoming quizzes" theme={theme} />
              <StatCard icon="book-outline" tint={GREEN} value={subjects} label="Subjects" theme={theme} />
              <StatCard icon="checkmark-circle-outline" tint={PURPLE} value={taken} label="Quizzes taken" theme={theme} />
              <StatCard icon="document-text-outline" tint={STREAK} value={notes} label="Notes" theme={theme} />
            </View>

            {/* Add quiz */}
            <Pressable
              onPress={() => router.push('/quizzes')}
              style={[styles.addBtn, { borderColor: theme.border }]}>
              <View style={[styles.addPlus, { backgroundColor: Brand.primary }]}>
                <Ionicons name="add" size={18} color={Brand.onPrimary} />
              </View>
              <ThemedText type="smallBold" style={{ color: Brand.primary, fontSize: 14.5 }}>
                Magdagdag ng quiz
              </ThemedText>
            </Pressable>

            {!hasData && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyNote}>
                Parang bagong notebook, ang sarap simulan. Isa muna, sabay nating handaan.
              </ThemedText>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/**
 * Weekly study graph — seven day-bars on a shared baseline with the percent
 * change versus last week. Bars scale to the busiest day; today is highlighted
 * in the brand color, the rest sit dimmed so the trend reads at a glance.
 */
function WeekGraph({
  week,
  delta,
  theme,
  width,
}: {
  week: WeekBar[];
  delta: number | null;
  theme: ReturnType<typeof useTheme>;
  width: number;
}) {
  const maxBar = Math.max(1, ...week.map((b) => b.count));

  return (
    <View style={[styles.weekCard, { width, backgroundColor: theme.backgroundElement }, softShadow]}>
      <View style={styles.weekHead}>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.weekTitle}
          numberOfLines={2}>
          Aral ngayong linggo
        </ThemedText>
        {delta !== null && (
          <ThemedText style={[styles.deltaText, { color: delta >= 0 ? GREEN : theme.danger }]}>
            {delta >= 0 ? '+' : ''}
            {delta}%
          </ThemedText>
        )}
      </View>

      <View style={styles.bars}>
        {week.map((b) => (
          <View key={b.day} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(8, Math.round((b.count / maxBar) * 100))}%`,
                    backgroundColor: b.isToday ? Brand.primary : Brand.primary + '52',
                  },
                ]}
              />
            </View>
            <ThemedText
              style={[styles.barLabel, { color: b.isToday ? Brand.primary : theme.textSecondary }]}>
              {tagalogInitial(b.day)}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatCard({
  icon,
  tint,
  value,
  label,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  value: number;
  label: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }, softShadow]}>
      <View style={[styles.statIcon, { backgroundColor: tint + Alpha.soft }]}>
        <Ionicons name={icon} size={17} color={tint} />
      </View>
      <ThemedText style={[styles.statValue, { color: theme.text }]}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={{ fontWeight: '700', fontSize: 12.5, marginTop: 1 }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingTop: 6, paddingBottom: FloatingTabBarSpace, alignItems: 'center' },
  // Centered reading column: full width on phones, capped on tablets/web.
  column: { width: '100%', maxWidth: MAX_COLUMN, paddingHorizontal: H_PADDING },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.two },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  streakChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  bell: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: 4, borderWidth: 1.5 },

  ellaBlock: { position: 'relative', marginTop: Spacing.two },
  ellaFigure: {
    position: 'absolute',
    right: -14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  glow: { position: 'absolute', top: 30, opacity: 0.9 },
  ellaText: { position: 'relative', zIndex: 2, width: '56%', paddingTop: 6, flex: 1 },
  greeting: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5, lineHeight: 23 },
  ellaLine: { fontWeight: '700', lineHeight: 19, marginTop: 5, fontSize: 12.5 },

  // flex:1 so the card stretches down its column to match Ella's height.
  weekCard: { flex: 1, marginTop: Spacing.three, paddingTop: 12, paddingHorizontal: 13, paddingBottom: 12, borderRadius: 16, minHeight: 96 },
  weekHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  weekTitle: { fontWeight: '800', fontSize: 11, lineHeight: 14, flex: 1 },
  deltaText: { fontWeight: '900', fontSize: 11 },
  // bars area fills whatever vertical space the card has; bars scale by percent.
  bars: { flex: 1, flexDirection: 'row', alignItems: 'stretch', gap: 6, marginTop: 12 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', minHeight: 4, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barLabel: { fontSize: 8.5, fontWeight: '800', marginTop: 5 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 11 },
  sectionTitle: { fontSize: 14, fontWeight: '900', letterSpacing: -0.2 },

  nextCard: { position: 'relative', borderRadius: 20, padding: 16, paddingLeft: 18, overflow: 'hidden' },
  nextAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  nextTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  nextTitle: { fontSize: 16.5, fontWeight: '900' },
  daysBadge: { alignItems: 'center', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9 },
  reviewBtn: { marginTop: 13, borderRadius: 13, paddingVertical: 11, alignItems: 'center' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', flexGrow: 1, borderRadius: 20, padding: 15 },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 34, fontWeight: '900', lineHeight: 38, marginTop: 11 },

  addBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addPlus: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  emptyNote: { textAlign: 'center', marginTop: 14, lineHeight: 19, fontSize: 12.5, paddingHorizontal: 14 },
});
