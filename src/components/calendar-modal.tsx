/**
 * A themed calendar in a bottom-sheet modal, used to pick a quiz date.
 * Wraps react-native-calendars (pure JS, so it runs fine in Expo Go).
 */

import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useResolvedScheme } from '@/hooks/use-resolved-scheme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  visible: boolean;
  value: string | null; // 'YYYY-MM-DD'
  onSelect: (date: string) => void;
  onClose: () => void;
};

export function CalendarModal({ visible, value, onSelect, onClose }: Props) {
  const theme = useTheme();
  const scheme = useResolvedScheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.background }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: theme.backgroundSelected }]} />
          <ThemedText type="smallBold" style={styles.title}>
            Pick a date
          </ThemedText>
          <Calendar
            key={scheme} /* re-mount on theme change so colors refresh */
            initialDate={value ?? undefined}
            onDayPress={(day) => {
              onSelect(day.dateString);
              onClose();
            }}
            markedDates={value ? { [value]: { selected: true, selectedColor: Brand.primary } } : {}}
            enableSwipeMonths
            theme={{
              calendarBackground: theme.background,
              monthTextColor: theme.text,
              dayTextColor: theme.text,
              textSectionTitleColor: theme.textSecondary,
              textDisabledColor: theme.backgroundSelected,
              todayTextColor: Brand.primary,
              arrowColor: Brand.primary,
              selectedDayBackgroundColor: Brand.primary,
              selectedDayTextColor: Brand.onPrimary,
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: Spacing.three },
  title: { marginBottom: Spacing.two, marginLeft: Spacing.one },
});
