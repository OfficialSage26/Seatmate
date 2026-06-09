import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alpha, Brand, Spacing, softShadow } from '@/constants/theme';
import { SUBJECT_COLORS } from '@/constants/academic';
import { addSubject, deleteSubject, listSubjects } from '@/db/repositories/subjects';
import type { Subject } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';

export default function SubjectsScreen() {
  const theme = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(SUBJECT_COLORS[0]);

  const refresh = useCallback(() => setSubjects(listSubjects()), []);
  useFocusEffect(useCallback(() => refresh(), [refresh]));

  const canAdd = name.trim().length > 0;

  function submit() {
    if (!canAdd) return;
    addSubject(name.trim(), color);
    setName('');
    setColor(SUBJECT_COLORS[0]);
    setAdding(false);
    refresh();
  }

  function remove(s: Subject) {
    Alert.alert('Delete subject?', `Remove "${s.name}"? Quizzes you've logged under it stay.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteSubject(s.id); refresh(); } },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <View>
            <ThemedText type="subtitle">Subjects</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setAdding((a) => !a)}
            style={[styles.addBtn, { backgroundColor: Brand.primary }, softShadow]}>
            <ThemedText type="smallBold" style={{ color: Brand.onPrimary }}>
              {adding ? 'Close' : '+ Add'}
            </ThemedText>
          </Pressable>
        </View>

        {adding && (
          <View style={[styles.form, { backgroundColor: theme.backgroundElement }]}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Subject name (e.g. Biology)"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={40}
            />
            <ThemedText type="smallBold" themeColor="textSecondary">
              Color
            </ThemedText>
            <View style={styles.swatchRow}>
              {SUBJECT_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.swatch,
                    { backgroundColor: c, borderColor: color === c ? theme.text : 'transparent' },
                  ]}
                />
              ))}
            </View>
            <Pressable
              onPress={submit}
              disabled={!canAdd}
              style={[styles.saveBtn, { backgroundColor: canAdd ? Brand.primary : theme.backgroundSelected }]}>
              <ThemedText type="smallBold" style={{ color: Brand.onPrimary }}>
                Save subject
              </ThemedText>
            </Pressable>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {subjects.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyBadge, { backgroundColor: Brand.primary + Alpha.soft }]}>
                <ThemedText style={styles.emptyEmoji}>📚</ThemedText>
              </View>
              <ThemedText type="default" style={{ fontWeight: '700' }}>
                No subjects yet
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                Add your classes here, then tag your quizzes with them.
              </ThemedText>
            </View>
          ) : (
            subjects.map((s) => (
              <View key={s.id} style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <ThemedText type="default" style={[styles.flex, { fontWeight: '600' }]} numberOfLines={1}>
                  {s.name}
                </ThemedText>
                <Pressable onPress={() => remove(s)} hitSlop={8}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Delete
                  </ThemedText>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.three },
  addBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },
  form: { borderRadius: Spacing.four, padding: Spacing.three, gap: Spacing.three, marginBottom: Spacing.three },
  input: { borderRadius: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, fontSize: 16 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
  saveBtn: { borderRadius: Spacing.three, paddingVertical: Spacing.three, alignItems: 'center' },
  list: { gap: Spacing.two, paddingBottom: Spacing.six },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  dot: { width: 16, height: 16, borderRadius: 8 },
  flex: { flex: 1 },
  empty: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.six },
  emptyBadge: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  emptyEmoji: { fontSize: 44 },
  center: { textAlign: 'center', paddingHorizontal: Spacing.five },
});
