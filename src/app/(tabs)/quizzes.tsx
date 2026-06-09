import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarModal } from '@/components/calendar-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getLine } from '@/companions/dialogue';
import type { TriggerKey } from '@/companions/types';
import { Alpha, Brand, Spacing, softShadow } from '@/constants/theme';
import {
  addQuiz,
  addSurpriseQuiz,
  deleteQuiz,
  listQuizzes,
  setQuizScore,
} from '@/db/repositories/quizzes';
import { listSubjects } from '@/db/repositories/subjects';
import type { Quiz, Subject } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/store/profile';

function scoreTrigger(score: number, max: number): TriggerKey {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 85) return 'quiz_scored_high';
  if (pct >= 60) return 'quiz_scored_mid';
  return 'quiz_scored_low';
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function QuizzesScreen() {
  const theme = useTheme();
  const profile = useProfileStore((s) => s.profile)!;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [reaction, setReaction] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setQuizzes(listQuizzes());
    setSubjects(listSubjects());
  }, []);
  useFocusEffect(useCallback(() => refresh(), [refresh]));

  // Regular add form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [secret, setSecret] = useState(false);
  const [maxScore, setMaxScore] = useState('100');
  const [showCalendar, setShowCalendar] = useState(false);

  // Surprise modal
  const [showSurprise, setShowSurprise] = useState(false);
  const [sTitle, setSTitle] = useState('');
  const [sSubject, setSSubject] = useState('');

  const canAdd = title.trim() && subject.trim() && date;
  const canSurprise = sTitle.trim() && sSubject.trim();

  function resetForm() {
    setTitle('');
    setSubject('');
    setDate(null);
    setSecret(false);
    setMaxScore('100');
  }

  function submitQuiz() {
    if (!canAdd) return;
    addQuiz({
      title: title.trim(),
      subject: subject.trim(),
      date: date!,
      maxScore: secret ? 0 : Number(maxScore) || 0,
    });
    setReaction(getLine(profile.companionId, 'quiz_added', { name: profile.name, subject: subject.trim() }));
    resetForm();
    setShowForm(false);
    refresh();
  }

  function submitSurprise() {
    if (!canSurprise) return;
    addSurpriseQuiz(sTitle.trim(), sSubject.trim());
    setReaction(getLine(profile.companionId, 'surprise_quiz', { name: profile.name, subject: sSubject.trim() }));
    setSTitle('');
    setSSubject('');
    setShowSurprise(false);
    refresh();
  }

  function saveScore(quiz: Quiz, scoreStr: string, outOfStr: string) {
    const score = Number(scoreStr);
    if (!Number.isFinite(score)) return;
    const knownMax = quiz.maxScore > 0;
    const effectiveMax = knownMax ? quiz.maxScore : Number(outOfStr);
    if (!knownMax && !(effectiveMax > 0)) return; // secret quiz needs a revealed total
    setQuizScore(quiz.id, score, knownMax ? undefined : effectiveMax);
    setReaction(
      getLine(profile.companionId, scoreTrigger(score, effectiveMax), {
        name: profile.name,
        subject: quiz.subject,
        score,
      }),
    );
    refresh();
  }

  const inputStyle = [styles.input, { backgroundColor: theme.background, color: theme.text }];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <ThemedText type="subtitle">Quizzes</ThemedText>
          <View style={styles.headerBtns}>
            <Pressable
              onPress={() => setShowSurprise(true)}
              style={[styles.surpriseBtn, { borderColor: Brand.primary }]}>
              <ThemedText type="smallBold" style={{ color: Brand.primary }}>
                ⚡ Surprise
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setShowForm((v) => !v)}
              style={[styles.addBtn, { backgroundColor: Brand.primary }, softShadow]}>
              <ThemedText type="smallBold" style={{ color: Brand.onPrimary }}>
                {showForm ? 'Close' : '+ Quiz'}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {reaction && (
          <View style={[styles.reaction, { backgroundColor: Brand.primary + Alpha.soft }]}>
            <ThemedText type="small" style={{ color: theme.text }}>
              💬 {reaction}
            </ThemedText>
          </View>
        )}

        {showForm && (
          <View style={[styles.form, { backgroundColor: theme.backgroundElement }]}>
            <TextInput
              style={inputStyle}
              placeholder="Title (e.g. Chapter 3 Quiz)"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <SubjectPicker
              subjects={subjects}
              value={subject}
              onChange={setSubject}
              theme={theme}
            />

            {/* Date via calendar */}
            <Pressable onPress={() => setShowCalendar(true)} style={inputStyle}>
              <ThemedText type="default" style={{ color: date ? theme.text : theme.textSecondary }}>
                {date ? `📅  ${formatDate(date)}` : '📅  Pick a date'}
              </ThemedText>
            </Pressable>

            {/* Secret total toggle */}
            <Pressable onPress={() => setSecret((s) => !s)} style={styles.toggleRow}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.textSecondary, backgroundColor: secret ? Brand.primary : 'transparent' },
                ]}>
                {secret && <ThemedText style={{ color: Brand.onPrimary, fontSize: 12 }}>✓</ThemedText>}
              </View>
              <View style={styles.flex}>
                <ThemedText type="small" style={{ fontWeight: '600' }}>
                  Keep the total a secret 🔒
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  You&apos;ll enter the total when you log your score.
                </ThemedText>
              </View>
            </Pressable>

            {!secret && (
              <View style={styles.row}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.maxLabel}>
                  Total points
                </ThemedText>
                <TextInput
                  style={[inputStyle, styles.maxInput]}
                  placeholder="100"
                  placeholderTextColor={theme.textSecondary}
                  value={maxScore}
                  onChangeText={(t) => setMaxScore(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                />
              </View>
            )}

            <Pressable
              onPress={submitQuiz}
              disabled={!canAdd}
              style={[styles.saveBtn, { backgroundColor: canAdd ? Brand.primary : theme.backgroundSelected }]}>
              <ThemedText type="smallBold" style={{ color: Brand.onPrimary }}>
                Save quiz
              </ThemedText>
            </Pressable>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {quizzes.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyBadge, { backgroundColor: Brand.primary + Alpha.soft }]}>
                <ThemedText style={styles.emptyEmoji}>📝</ThemedText>
              </View>
              <ThemedText type="default" style={{ fontWeight: '700' }}>
                No quizzes yet
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                Tap “+ Quiz” to track one, or log a “⚡ Surprise” pop quiz.
              </ThemedText>
            </View>
          ) : (
            quizzes.map((q) => (
              <QuizRow
                key={q.id}
                quiz={q}
                theme={theme}
                onSaveScore={saveScore}
                onDelete={(id) => { deleteQuiz(id); refresh(); }}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <CalendarModal
        visible={showCalendar}
        value={date}
        onSelect={setDate}
        onClose={() => setShowCalendar(false)}
      />

      {/* Surprise quiz modal */}
      <Modal visible={showSurprise} transparent animationType="slide" onRequestClose={() => setShowSurprise(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowSurprise(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.background }]} onPress={() => {}}>
            <View style={[styles.handle, { backgroundColor: theme.backgroundSelected }]} />
            <ThemedText type="subtitle">⚡ Surprise quiz</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
              Got ambushed? Log it for today — the total stays secret until you reveal your score.
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
              placeholder="Title (e.g. Pop Quiz)"
              placeholderTextColor={theme.textSecondary}
              value={sTitle}
              onChangeText={setSTitle}
            />
            <SubjectPicker subjects={subjects} value={sSubject} onChange={setSSubject} theme={theme} />
            <Pressable
              onPress={submitSurprise}
              disabled={!canSurprise}
              style={[styles.saveBtn, { backgroundColor: canSurprise ? Brand.primary : theme.backgroundSelected }]}>
              <ThemedText type="smallBold" style={{ color: Brand.onPrimary }}>
                Log surprise quiz
              </ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

// ── Subject quick-picker (chips of existing subjects + free text) ──────────
function SubjectPicker({
  subjects,
  value,
  onChange,
  theme,
}: {
  subjects: Subject[];
  value: string;
  onChange: (v: string) => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.subjectWrap}>
      {subjects.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {subjects.map((s) => {
            const selected = value === s.name;
            return (
              <Pressable
                key={s.id}
                onPress={() => onChange(s.name)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? s.color : s.color + Alpha.soft,
                  },
                ]}>
                <ThemedText type="small" style={{ color: selected ? '#fff' : s.color, fontWeight: '600' }}>
                  {s.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <TextInput
        style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
        placeholder={subjects.length ? 'or type a subject' : 'Subject (e.g. Biology)'}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

// ── A single quiz row, with secret-aware scoring ───────────────────────────
function QuizRow({
  quiz,
  theme,
  onSaveScore,
  onDelete,
}: {
  quiz: Quiz;
  theme: ReturnType<typeof useTheme>;
  onSaveScore: (quiz: Quiz, score: string, outOf: string) => void;
  onDelete: (id: number) => void;
}) {
  const [score, setScore] = useState('');
  const [outOf, setOutOf] = useState('');
  const taken = quiz.score !== null;
  const secret = quiz.maxScore === 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.cardTop}>
        <View style={styles.flex}>
          <View style={styles.titleRow}>
            {quiz.isSurprise === 1 && (
              <View style={[styles.badge, { backgroundColor: Brand.primary + Alpha.soft }]}>
                <ThemedText type="small" style={{ color: Brand.primary, fontWeight: '700' }}>
                  ⚡ Surprise
                </ThemedText>
              </View>
            )}
            <ThemedText type="default" style={{ fontWeight: '700' }} numberOfLines={1}>
              {quiz.title}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {quiz.subject} · {formatDate(quiz.date)}
            {secret && !taken ? ' · total secret 🔒' : ''}
          </ThemedText>
        </View>
        {taken ? (
          <View style={[styles.scorePill, { backgroundColor: Brand.primary }]}>
            <ThemedText type="smallBold" style={{ color: Brand.onPrimary }}>
              {quiz.score}/{quiz.maxScore}
            </ThemedText>
          </View>
        ) : (
          <Pressable onPress={() => onDelete(quiz.id)} hitSlop={8}>
            <ThemedText type="small" themeColor="textSecondary">
              Delete
            </ThemedText>
          </Pressable>
        )}
      </View>

      {!taken && (
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex, { backgroundColor: theme.background, color: theme.text }]}
            placeholder="Score"
            placeholderTextColor={theme.textSecondary}
            value={score}
            onChangeText={(t) => setScore(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
          />
          {secret && (
            <>
              <ThemedText type="default" themeColor="textSecondary" style={styles.outOf}>
                /
              </ThemedText>
              <TextInput
                style={[styles.input, styles.outOfInput, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="Total"
                placeholderTextColor={theme.textSecondary}
                value={outOf}
                onChangeText={(t) => setOutOf(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
            </>
          )}
          <Pressable
            onPress={() => onSaveScore(quiz, score, outOf)}
            disabled={!score || (secret && !outOf)}
            style={[
              styles.logBtn,
              { backgroundColor: score && (!secret || outOf) ? Brand.primary : theme.backgroundSelected },
            ]}>
            <ThemedText type="smallBold" style={{ color: Brand.onPrimary }}>
              Log
            </ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.three },
  headerBtns: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  surpriseBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999, borderWidth: 1.5 },
  addBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },
  reaction: { borderRadius: Spacing.three, padding: Spacing.three, marginBottom: Spacing.three },
  form: { borderRadius: Spacing.four, padding: Spacing.three, gap: Spacing.three, marginBottom: Spacing.three },
  subjectWrap: { gap: Spacing.two },
  chips: { gap: Spacing.two, paddingRight: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },
  row: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  flex: { flex: 1 },
  maxLabel: { flex: 1 },
  maxInput: { width: 90 },
  toggleRow: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  input: { borderRadius: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, fontSize: 16 },
  saveBtn: { borderRadius: Spacing.three, paddingVertical: Spacing.three, alignItems: 'center' },
  logBtn: { borderRadius: Spacing.three, paddingHorizontal: Spacing.four, justifyContent: 'center', alignItems: 'center' },
  outOf: { paddingHorizontal: 2 },
  outOfInput: { width: 80 },
  list: { gap: Spacing.three, paddingBottom: Spacing.six },
  card: { borderRadius: Spacing.four, padding: Spacing.three, gap: Spacing.three },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  badge: { paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: 999 },
  scorePill: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: 999 },
  empty: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.six },
  emptyBadge: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  emptyEmoji: { fontSize: 44 },
  center: { textAlign: 'center', paddingHorizontal: Spacing.five },
  // surprise modal
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' },
  sheet: { borderTopLeftRadius: Spacing.four, borderTopRightRadius: Spacing.four, padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: Spacing.one },
});
