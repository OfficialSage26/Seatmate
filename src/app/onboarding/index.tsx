import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Dropdown, type DropdownSection } from '@/components/dropdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { COMPANIONS } from '@/companions/companions';
import { getLine } from '@/companions/dialogue';
import type { Companion } from '@/companions/types';
import { ageFromBirthday, daysInMonth, GRADE_SECTIONS, MONTHS } from '@/constants/academic';
import { Alpha, Brand, Spacing, softShadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/store/profile';

const STEPS = ['welcome', 'name', 'dob', 'gender', 'grade', 'companion'] as const;

type ProfileGender = 'male' | 'female' | 'nonbinary' | 'unspecified';

export default function Onboarding() {
  const theme = useTheme();
  const router = useRouter();
  const createProfile = useProfileStore((s) => s.createProfile);

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Collected answers
  const [name, setName] = useState('');
  const [month, setMonth] = useState<string | null>(null); // '1'..'12'
  const [day, setDay] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [gender, setGender] = useState<ProfileGender | null>(null);
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [companionIndex, setCompanionIndex] = useState(0);

  const step = STEPS[stepIndex];

  // ── Derived values ───────────────────────────────────────────────────────
  const age = useMemo(() => {
    if (!month || !day || !year) return null;
    const a = ageFromBirthday(Number(year), Number(month), Number(day));
    return a >= 0 && a < 120 ? a : null;
  }, [month, day, year]);

  const canProceed = (() => {
    switch (step) {
      case 'welcome':
        return true;
      case 'name':
        return name.trim().length > 0;
      case 'dob':
        return age !== null && age >= 3;
      case 'gender':
        return true; // optional
      case 'grade':
        return gradeLevel !== null;
      case 'companion':
        return true;
    }
  })();

  // ── Slide/fade transition between steps ──────────────────────────────────
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [stepIndex, anim]);
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [direction >= 0 ? 48 : -48, 0],
  });

  function goNext() {
    if (!canProceed) return;
    if (stepIndex === STEPS.length - 1) {
      finish();
      return;
    }
    setDirection(1);
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex === 0) return;
    setDirection(-1);
    setStepIndex((i) => i - 1);
  }

  function finish() {
    const birthday =
      year && month && day
        ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        : null;
    createProfile({
      name: name.trim(),
      age: age ?? 0,
      birthday,
      gender: gender ?? 'unspecified',
      gradeLevel: gradeLevel!,
      companionId: COMPANIONS[companionIndex].id,
    });
    router.replace('/(tabs)');
  }

  // ── Dropdown option sets for the DOB step ────────────────────────────────
  const monthSections: DropdownSection[] = [
    { options: MONTHS.map((m, i) => ({ label: m, value: String(i + 1) })) },
  ];
  const dayCount = month && year ? daysInMonth(Number(year), Number(month)) : 31;
  const daySections: DropdownSection[] = [
    { options: Array.from({ length: dayCount }, (_, i) => ({ label: String(i + 1), value: String(i + 1) })) },
  ];
  const thisYear = new Date().getFullYear();
  const yearSections: DropdownSection[] = [
    {
      options: Array.from({ length: 40 }, (_, i) => {
        const y = thisYear - 4 - i;
        return { label: String(y), value: String(y) };
      }),
    },
  ];

  const buttonLabel =
    step === 'welcome'
      ? 'Get Started'
      : step === 'companion'
        ? `Choose ${COMPANIONS[companionIndex].name} →`
        : step === 'gender' && gender === null
          ? 'Skip'
          : 'Continue';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header: back + progress dots */}
        <View style={styles.header}>
          {stepIndex > 0 ? (
            <Pressable onPress={goBack} hitSlop={12}>
              <ThemedText type="default">‹ Back</ThemedText>
            </Pressable>
          ) : (
            <View style={{ width: 50 }} />
          )}
          <View style={styles.dots}>
            {STEPS.map((s, i) => (
              <View
                key={s}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === stepIndex ? Brand.primary : theme.backgroundSelected,
                    width: i === stepIndex ? 22 : 8,
                  },
                ]}
              />
            ))}
          </View>
          <View style={{ width: 50 }} />
        </View>

        {/* Animated step content */}
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View style={[styles.flex, { opacity: anim, transform: [{ translateX }] }]}>
            <Step
              step={step}
              theme={theme}
              name={name}
              setName={setName}
              month={month}
              setMonth={setMonth}
              day={day}
              setDay={setDay}
              year={year}
              setYear={setYear}
              age={age}
              gender={gender}
              setGender={setGender}
              gradeLevel={gradeLevel}
              setGradeLevel={setGradeLevel}
              companionIndex={companionIndex}
              setCompanionIndex={setCompanionIndex}
              monthSections={monthSections}
              daySections={daySections}
              yearSections={yearSections}
            />
          </Animated.View>
        </KeyboardAvoidingView>

        {/* Footer button */}
        <View style={styles.footer}>
          <Pressable
            onPress={goNext}
            disabled={!canProceed}
            style={[styles.cta, { backgroundColor: canProceed ? Brand.primary : theme.backgroundSelected }, softShadow]}>
            <ThemedText type="default" style={{ color: Brand.onPrimary, fontWeight: '700' }}>
              {buttonLabel}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Step renderer
// ───────────────────────────────────────────────────────────────────────────

type StepProps = {
  step: (typeof STEPS)[number];
  theme: ReturnType<typeof useTheme>;
  name: string;
  setName: (v: string) => void;
  month: string | null;
  setMonth: (v: string) => void;
  day: string | null;
  setDay: (v: string) => void;
  year: string | null;
  setYear: (v: string) => void;
  age: number | null;
  gender: ProfileGender | null;
  setGender: (v: ProfileGender) => void;
  gradeLevel: string | null;
  setGradeLevel: (v: string) => void;
  companionIndex: number;
  setCompanionIndex: (i: number) => void;
  monthSections: DropdownSection[];
  daySections: DropdownSection[];
  yearSections: DropdownSection[];
};

function Step(props: StepProps) {
  const { step, theme } = props;

  if (step === 'welcome') {
    return (
      <View style={[styles.stepPad, styles.center]}>
        <View style={[styles.welcomeBadge, { backgroundColor: Brand.primary + Alpha.soft }]}>
          <ThemedText style={styles.welcomeEmoji}>🎓</ThemedText>
        </View>
        <ThemedText type="title" style={styles.centerText}>
          Welcome to{'\n'}Seatmate
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.centerText}>
          Your study buddy that actually has your back — track quizzes, subjects, and grades, with a
          companion who keeps you company along the way.
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          Works fully offline. No account needed.
        </ThemedText>
      </View>
    );
  }

  if (step === 'name') {
    return (
      <View style={styles.stepPad}>
        <ThemedText type="subtitle">What should we call you?</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.gapBottom}>
          This is how your companion will greet you.
        </ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          value={props.name}
          onChangeText={props.setName}
          placeholder="Your name"
          placeholderTextColor={theme.textSecondary}
          autoFocus
          returnKeyType="done"
          maxLength={30}
        />
      </View>
    );
  }

  if (step === 'dob') {
    return (
      <View style={styles.stepPad}>
        <ThemedText type="subtitle">When&apos;s your birthday?</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.gapBottom}>
          We&apos;ll work out your age automatically.
        </ThemedText>
        <View style={styles.row}>
          <View style={styles.flex2}>
            <Dropdown title="Month" placeholder="Month" value={props.month} sections={props.monthSections} onChange={props.setMonth} />
          </View>
          <View style={styles.flex1}>
            <Dropdown title="Day" placeholder="Day" value={props.day} sections={props.daySections} onChange={props.setDay} />
          </View>
          <View style={styles.flex1}>
            <Dropdown title="Year" placeholder="Year" value={props.year} sections={props.yearSections} onChange={props.setYear} />
          </View>
        </View>
        {props.age !== null && (
          <View style={[styles.ageChip, { backgroundColor: Brand.primary + Alpha.soft }]}>
            <ThemedText type="default" style={{ color: Brand.primary, fontWeight: '700' }}>
              You&apos;re {props.age} years old 🎂
            </ThemedText>
          </View>
        )}
      </View>
    );
  }

  if (step === 'gender') {
    const options: { value: ProfileGender; label: string; emoji: string }[] = [
      { value: 'male', label: 'Male', emoji: '👦' },
      { value: 'female', label: 'Female', emoji: '👧' },
      { value: 'nonbinary', label: 'Non-binary', emoji: '🧑' },
      { value: 'unspecified', label: 'Prefer not to say', emoji: '🤍' },
    ];
    return (
      <View style={styles.stepPad}>
        <ThemedText type="subtitle">Tell us about you</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.gapBottom}>
          Optional — pick what feels right, or skip.
        </ThemedText>
        <View style={styles.genderGrid}>
          {options.map((o) => {
            const selected = props.gender === o.value;
            return (
              <Pressable
                key={o.value}
                onPress={() => props.setGender(o.value)}
                style={[
                  styles.genderCard,
                  { backgroundColor: theme.backgroundElement, borderColor: selected ? Brand.primary : 'transparent' },
                ]}>
                <ThemedText style={styles.genderEmoji}>{o.emoji}</ThemedText>
                <ThemedText type="small" style={{ fontWeight: selected ? '700' : '500', textAlign: 'center' }}>
                  {o.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  if (step === 'grade') {
    return (
      <View style={styles.stepPad}>
        <ThemedText type="subtitle">What year are you in?</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.gapBottom}>
          Pick your current grade or year level.
        </ThemedText>
        <Dropdown placeholder="Select grade / year" value={props.gradeLevel} sections={GRADE_SECTIONS} onChange={props.setGradeLevel} />
      </View>
    );
  }

  // step === 'companion'
  return <CompanionCarousel index={props.companionIndex} onIndexChange={props.setCompanionIndex} />;
}

// ───────────────────────────────────────────────────────────────────────────
// Companion carousel (peek + scale/opacity motion)
// ───────────────────────────────────────────────────────────────────────────

// Cast back to `typeof FlatList` so JSX still infers the item type from `data`.
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList) as unknown as typeof FlatList;

function CompanionCarousel({
  index,
  onIndexChange,
}: {
  index: number;
  onIndexChange: (i: number) => void;
}) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const ITEM_W = Math.round(width * 0.8);
  const SIDE = (width - ITEM_W) / 2;
  const scrollX = useRef(new Animated.Value(index * ITEM_W)).current;

  return (
    <View style={styles.flex}>
      <View style={styles.stepPad}>
        <ThemedText type="subtitle">Meet your seatmate</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Swipe to explore. Pick the one that fits you — you can change them later.
        </ThemedText>
      </View>

      <View style={styles.carouselArea}>
        <AnimatedFlatList
          data={COMPANIONS}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_W}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: SIDE }}
          getItemLayout={(_, i) => ({ length: ITEM_W, offset: ITEM_W * i, index: i })}
          initialScrollIndex={index}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / ITEM_W);
            if (i !== index) onIndexChange(i);
          }}
          renderItem={({ item, index: i }) => (
            <CompanionCard companion={item} itemWidth={ITEM_W} pos={i} scrollX={scrollX} theme={theme} />
          )}
        />
      </View>

      <View style={styles.carouselDots}>
        {COMPANIONS.map((c, i) => (
          <View
            key={c.id}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? COMPANIONS[index].color : theme.backgroundSelected,
                width: i === index ? 22 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function CompanionCard({
  companion,
  itemWidth,
  pos,
  scrollX,
  theme,
}: {
  companion: Companion;
  itemWidth: number;
  pos: number;
  scrollX: Animated.Value;
  theme: ReturnType<typeof useTheme>;
}) {
  const inputRange = [(pos - 1) * itemWidth, pos * itemWidth, (pos + 1) * itemWidth];
  const scale = scrollX.interpolate({ inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp' });
  const opacity = scrollX.interpolate({ inputRange, outputRange: [0.55, 1, 0.55], extrapolate: 'clamp' });

  return (
    <Animated.View style={{ width: itemWidth, transform: [{ scale }], opacity }}>
      <View style={[styles.cardInner, { backgroundColor: theme.backgroundElement }, softShadow]}>
        <View style={[styles.cardAvatar, { backgroundColor: companion.color + Alpha.soft }]}>
          <ThemedText style={styles.cardEmoji}>{companion.emoji}</ThemedText>
        </View>
        <ThemedText type="subtitle" style={{ color: companion.color }}>
          {companion.name}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.centerText}>
          {companion.tagline}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          {companion.blurb}
        </ThemedText>
        <View style={[styles.sampleLine, { borderColor: companion.color }]}>
          <ThemedText type="small" style={{ color: companion.color }}>
            “{getLine(companion.id, 'home_greeting', { name: 'you' })}”
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  flex1: { flex: 1 },
  flex2: { flex: 1.4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  dots: { flexDirection: 'row', gap: Spacing.one, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },

  stepPad: { paddingHorizontal: Spacing.four, gap: Spacing.two, paddingTop: Spacing.four },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three },
  centerText: { textAlign: 'center' },
  gapBottom: { marginBottom: Spacing.three },

  welcomeBadge: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  welcomeEmoji: { fontSize: 64 },

  input: { borderRadius: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, fontSize: 18 },
  row: { flexDirection: 'row', gap: Spacing.two },
  ageChip: { marginTop: Spacing.three, alignSelf: 'flex-start', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },

  genderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  genderCard: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 2,
  },
  genderEmoji: { fontSize: 40 },

  // Carousel
  carouselArea: { flex: 1, justifyContent: 'center' },
  cardInner: {
    marginHorizontal: Spacing.two,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
  },
  cardAvatar: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 64 },
  sampleLine: { borderLeftWidth: 3, paddingLeft: Spacing.three, marginTop: Spacing.two },
  carouselDots: { flexDirection: 'row', gap: Spacing.one, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.three },

  footer: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.three },
  cta: { borderRadius: Spacing.three, paddingVertical: Spacing.three, alignItems: 'center' },
});
