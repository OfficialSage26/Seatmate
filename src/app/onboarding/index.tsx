import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
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
import { ELLA } from '@/companions/companions';
import { getLine } from '@/companions/dialogue';
import { ageFromBirthday, daysInMonth, GRADE_SECTIONS, MONTHS } from '@/constants/academic';
import { Alpha, Brand, Spacing, softShadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/store/profile';

const STEPS = ['welcome', 'name', 'dob', 'gender', 'grade', 'ready'] as const;

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
      case 'ready':
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
      companionId: ELLA.id,
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
      ? 'Nice to meet you!'
      : step === 'ready'
        ? 'Tara, let\'s go!'
        : step === 'gender' && gender === null
          ? 'Skip muna'
          : 'Next';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header: back + progress dots */}
        <View style={styles.header}>
          {stepIndex > 0 ? (
            <Pressable onPress={goBack} hitSlop={12} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={18} color={theme.text} />
              <ThemedText type="default">Back</ThemedText>
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
  monthSections: DropdownSection[];
  daySections: DropdownSection[];
  yearSections: DropdownSection[];
};

function Step(props: StepProps) {
  const { step, theme } = props;

  if (step === 'welcome') {
    return (
      <View style={[styles.stepPad, styles.center]}>
        <EllaHero />
        <ThemedText type="title" style={styles.centerText}>
          Hi, ako si Ella
        </ThemedText>
        <View style={[styles.introBubble, { backgroundColor: theme.backgroundElement }, softShadow]}>
          <ThemedText type="default" style={styles.centerText}>
            {getLine(ELLA.id, 'onboarding_intro')}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          Works offline, walang internet needed. No account, no hassle.
        </ThemedText>
      </View>
    );
  }

  if (step === 'ready') {
    return (
      <View style={[styles.stepPad, styles.center]}>
        <EllaHero source={ELLA.cheerful} ratio={CHEER_RATIO} />
        <ThemedText type="title" style={styles.centerText}>
          All set na{props.name.trim() ? `, ${props.name.trim()}` : ''}
        </ThemedText>
        <View style={[styles.introBubble, { backgroundColor: theme.backgroundElement }, softShadow]}>
          <ThemedText type="default" style={styles.centerText}>
            {getLine(ELLA.id, 'onboarding_ready', { name: props.name.trim() || 'there' })}
          </ThemedText>
        </View>
      </View>
    );
  }

  if (step === 'name') {
    return (
      <View style={styles.stepPad}>
        <EllaAsk
          theme={theme}
          question="Una, ano'ng itatawag ko sa'yo?"
          hint="Ito'ng gagamitin ko every time na babatiin kita."
        />
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
        <EllaAsk
          theme={theme}
          question={`Kailan birthday mo${props.name.trim() ? `, ${props.name.trim()}` : ''}?`}
          hint="Dito ko na kukunin ang age mo, di mo na kailangang i-type."
        />
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
              You&apos;re {props.age} years old
            </ThemedText>
          </View>
        )}
      </View>
    );
  }

  if (step === 'gender') {
    const options: { value: ProfileGender; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
      { value: 'male', label: 'Male', icon: 'male' },
      { value: 'female', label: 'Female', icon: 'female' },
      { value: 'nonbinary', label: 'Non-binary', icon: 'male-female' },
      { value: 'unspecified', label: 'Prefer not to say', icon: 'help-circle-outline' },
    ];
    return (
      <View style={styles.stepPad}>
        <EllaAsk
          theme={theme}
          question={`Paano mo gustong i-describe ang sarili mo${props.name.trim() ? `, ${props.name.trim()}` : ''}?`}
          hint="Optional lang 'to. Pick what feels right, or skip it."
        />
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
                <Ionicons name={o.icon} size={36} color={selected ? Brand.primary : theme.textSecondary} />
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
        <EllaAsk
          theme={theme}
          question="Tapos, anong year ka na ngayon?"
          hint="Para relevant sa'yo lahat ng makikita mo."
        />
        <Dropdown placeholder="Select grade / year" value={props.gradeLevel} sections={GRADE_SECTIONS} onChange={props.setGradeLevel} />
      </View>
    );
  }

  // `welcome` and `ready` are handled above; nothing else to render here.
  return null;
}

// ───────────────────────────────────────────────────────────────────────────
// Ella's hero — a big waist-up figure (~half the screen) on the intro/outro.
// ───────────────────────────────────────────────────────────────────────────

const WAIST_RATIO = 0.773; // width / height of the waist-up art
const CHEER_RATIO = 0.701; // width / height of the cheering pose
// The question standee uses a waist-up crop of the dashboard pose; its 210×175
// box matches that crop's ~1.2 ratio.

function EllaHero({
  source = ELLA.waistUp,
  ratio = WAIST_RATIO,
}: {
  source?: typeof ELLA.waistUp;
  ratio?: number;
}) {
  const { height } = useWindowDimensions();
  const h = Math.min(Math.round(height * 0.46), 460);
  const w = Math.round(h * ratio);
  return <Image source={source} style={{ width: w, height: h }} resizeMode="contain" />;
}

// A question posed by Ella: a small standee + a speech bubble, so each
// onboarding step feels like a conversation rather than a form.
function EllaAsk({
  question,
  hint,
  theme,
}: {
  question: string;
  hint?: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.askRow}>
      <Image source={ELLA.ask} style={styles.askFigure} resizeMode="contain" />
      <View style={[styles.askBubble, { backgroundColor: theme.backgroundElement }, softShadow]}>
        <ThemedText type="smallBold" style={{ color: ELLA.color }}>
          {ELLA.name}
        </ThemedText>
        <ThemedText type="default" style={styles.askQuestion}>
          {question}
        </ThemedText>
        {hint ? (
          <ThemedText type="small" themeColor="textSecondary">
            {hint}
          </ThemedText>
        ) : null}
      </View>
    </View>
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

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  // Ella intro / ready
  introBubble: { alignSelf: 'stretch', borderRadius: Spacing.four, padding: Spacing.four },

  // Ella asking a question (conversational step header)
  askRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 0, marginBottom: Spacing.three },
  // zIndex/elevation keep Ella in front so the bubble tucks behind her (the
  // bubble's softShadow uses elevation 3, so she needs a higher value on Android).
  askFigure: { width: 210, height: 175, zIndex: 2, elevation: 4 },
  askBubble: { flex: 1, borderRadius: Spacing.four, padding: Spacing.three, gap: 2, marginBottom: Spacing.two, marginLeft: -16 },
  askQuestion: { fontSize: 20, lineHeight: 27, fontWeight: '700' },

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

  footer: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.three },
  cta: { borderRadius: Spacing.three, paddingVertical: Spacing.three, alignItems: 'center' },
});
