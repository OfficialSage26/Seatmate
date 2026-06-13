import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FloatingTabBarSpace, Spacing } from '@/constants/theme';
import { addNote, deleteNote, listNotes, updateNote } from '@/db/repositories/notes';
import type { Note } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';

// Figma "Recent Notes" pastel palette. Keyed by note id (not grid position)
// so a card keeps its color and column no matter how the list reorders.
const NOTE_COLORS = ['#C4FFCA', '#C5CBFF', '#FBBECF', '#FDF3BF', '#96F4F4', '#FEC5FF'];
const noteColor = (id: number) => NOTE_COLORS[id % NOTE_COLORS.length];
const CARD_TITLE = '#646464';
const CARD_BODY = '#818181';

export default function NotesScreen() {
  const theme = useTheme();

  const [notes, setNotes] = useState<Note[]>([]);
  const refresh = useCallback(() => setNotes(listNotes()), []);
  useFocusEffect(useCallback(() => refresh(), [refresh]));

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Editor screen — used for both new notes and editing existing ones.
  const [editing, setEditing] = useState<Note | null>(null);
  const [editorColor, setEditorColor] = useState(NOTE_COLORS[0]);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
  }, [notes, query]);

  // Masonry: alternate cards into two independent columns.
  const columns = useMemo(() => {
    const left: Note[] = [];
    const right: Note[] = [];
    filtered.forEach((note, i) => (i % 2 === 0 ? left : right).push(note));
    return { left, right };
  }, [filtered]);

  function openNew() {
    setEditing(null);
    // Predict the next rowid so the editor tint matches the saved card.
    const nextId = notes.reduce((max, n) => Math.max(max, n.id), 0) + 1;
    setEditorColor(noteColor(nextId));
    setTitle('');
    setBody('');
    setShowEditor(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    setEditorColor(noteColor(note.id));
    setTitle(note.title);
    setBody(note.body);
    setShowEditor(true);
  }

  // The editor has no save button (per the design) — the back arrow commits.
  // Only write when something changed, so just peeking at a note doesn't
  // bump updatedAt and shuffle the grid.
  function saveAndClose() {
    const hasContent = title.trim().length > 0 || body.trim().length > 0;
    if (hasContent) {
      const finalTitle = title.trim() || 'Untitled note';
      const finalBody = body.trim();
      if (!editing) addNote(finalTitle, finalBody);
      else if (finalTitle !== editing.title || finalBody !== editing.body) updateNote(editing.id, finalTitle, finalBody);
    }
    setShowEditor(false);
    refresh();
  }

  function confirmDelete(note: Note, fromEditor = false) {
    Alert.alert('Delete note?', `“${note.title}” will be gone for good.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteNote(note.id);
          if (fromEditor) setShowEditor(false);
          refresh();
        },
      },
    ]);
  }

  const renderCard = (note: Note) => (
    <Pressable
      key={note.id}
      onPress={() => openEdit(note)}
      onLongPress={() => confirmDelete(note)}
      style={[styles.card, { backgroundColor: noteColor(note.id) }]}>
      <ThemedText type="default" style={styles.cardTitle} numberOfLines={2}>
        {note.title}
      </ThemedText>
      {note.body.length > 0 && (
        <ThemedText type="small" style={styles.cardBody} numberOfLines={8}>
          {note.body}
        </ThemedText>
      )}
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <View style={styles.headerActions} />
          <ThemedText type="default" style={styles.headerTitle}>
            Recent Notes
          </ThemedText>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => {
                setSearchOpen((open) => {
                  if (open) setQuery('');
                  return !open;
                });
              }}
              hitSlop={8}>
              <Ionicons name={searchOpen ? 'close' : 'search'} size={22} color={theme.text} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Add a note" onPress={openNew} hitSlop={8}>
              <Ionicons name="add" size={26} color={theme.text} />
            </Pressable>
          </View>
        </View>

        {searchOpen && (
          <TextInput
            style={[styles.search, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            placeholder="Search notes…"
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        )}

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyBadge, { backgroundColor: NOTE_COLORS[0] }]}>
                <Ionicons name="document-text" size={40} color={CARD_TITLE} />
              </View>
              <ThemedText type="default" style={{ fontWeight: '700' }}>
                {query ? 'No matching notes' : 'No notes yet'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                {query
                  ? 'Try a different search.'
                  : 'Tap “+” to jot down lessons, reminders, or anything worth remembering.'}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.masonry}>
              <View style={styles.column}>{columns.left.map(renderCard)}</View>
              <View style={styles.column}>{columns.right.map(renderCard)}</View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Full-screen editor tinted with the note's card color. */}
      <Modal visible={showEditor} animationType="slide" onRequestClose={saveAndClose}>
        <View style={[styles.editor, { backgroundColor: editorColor }]}>
          <SafeAreaView style={styles.editorSafe} edges={['top', 'bottom']}>
            <View style={styles.editorHeader}>
              <Pressable onPress={saveAndClose} hitSlop={8} style={styles.headerSide}>
                <Ionicons name="arrow-back" size={24} color="#333333" />
              </Pressable>
              <ThemedText type="default" style={[styles.headerTitle, { color: '#14304A' }]}>
                {editing ? 'Edit Note' : 'New Note'}
              </ThemedText>
              {editing ? (
                <Pressable onPress={() => confirmDelete(editing, true)} hitSlop={8} style={styles.headerSide}>
                  <Ionicons name="ellipsis-vertical" size={22} color="#14304A" />
                </Pressable>
              ) : (
                <View style={styles.headerSide} />
              )}
            </View>

            <TextInput
              style={styles.editorTitle}
              placeholder="Title"
              placeholderTextColor={CARD_BODY}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.editorBody}
              placeholder="Write your note…"
              placeholderTextColor={CARD_BODY}
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
            />
          </SafeAreaView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.three },
  headerSide: { width: 24, alignItems: 'flex-end' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, width: 64, justifyContent: 'flex-end' },
  headerTitle: { textAlign: 'center', fontWeight: '600' },
  search: { borderRadius: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2, fontSize: 15, marginBottom: Spacing.three },
  list: { paddingBottom: FloatingTabBarSpace },
  masonry: { flexDirection: 'row', gap: Spacing.three },
  column: { flex: 1, gap: Spacing.three },
  card: { borderRadius: 16, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three + 4, gap: Spacing.two },
  cardTitle: { color: CARD_TITLE, textAlign: 'center', fontWeight: '600' },
  cardBody: { color: CARD_BODY, textAlign: 'center', lineHeight: 18 },
  empty: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.six },
  emptyBadge: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  center: { textAlign: 'center', paddingHorizontal: Spacing.five },
  // editor
  editor: { flex: 1 },
  editorSafe: { flex: 1, paddingHorizontal: Spacing.four },
  editorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.three },
  editorTitle: { fontSize: 30, fontWeight: '600', color: CARD_TITLE, textAlign: 'center', marginTop: Spacing.three },
  editorBody: { flex: 1, fontSize: 20, lineHeight: 30, color: CARD_BODY, marginTop: Spacing.four, paddingBottom: Spacing.four },
});
