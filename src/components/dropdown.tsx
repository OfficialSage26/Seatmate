/**
 * A simple, dependency-free dropdown. Tapping the field opens a bottom sheet
 * (a Modal) listing the options, optionally grouped under section titles.
 * Used for grade/year and the date-of-birth pickers in onboarding.
 */

import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DropdownOption = { label: string; value: string };
export type DropdownSection = { title?: string; options: DropdownOption[] };

type Props = {
  value: string | null;
  placeholder: string;
  sections: DropdownSection[];
  onChange: (value: string) => void;
  /** Optional label shown above the field. */
  title?: string;
};

export function Dropdown({ value, placeholder, sections, onChange, title }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  let selectedLabel: string | null = null;
  for (const section of sections) {
    const match = section.options.find((o) => o.value === value);
    if (match) {
      selectedLabel = match.label;
      break;
    }
  }

  function select(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <View style={styles.wrap}>
      {title && <ThemedText type="smallBold">{title}</ThemedText>}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText
          type="default"
          style={{ color: selectedLabel ? theme.text : theme.textSecondary }}
          numberOfLines={1}>
          {selectedLabel ?? placeholder}
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          ▾
        </ThemedText>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        {/* Tapping the dimmed backdrop closes the sheet. */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* This inner Pressable captures touches so taps on the sheet don't close it. */}
          <Pressable style={[styles.sheet, { backgroundColor: theme.background }]} onPress={() => {}}>
            <View style={[styles.handle, { backgroundColor: theme.backgroundSelected }]} />
            <ScrollView showsVerticalScrollIndicator={false}>
              {sections.map((section, si) => (
                <View key={section.title ?? si} style={styles.section}>
                  {section.title && (
                    <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
                      {section.title.toUpperCase()}
                    </ThemedText>
                  )}
                  {section.options.map((opt) => {
                    const selected = opt.value === value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => select(opt.value)}
                        style={[
                          styles.option,
                          { backgroundColor: selected ? Brand.primary : theme.backgroundElement },
                        ]}>
                        <ThemedText
                          type="default"
                          style={{ color: selected ? Brand.onPrimary : theme.text }}>
                          {opt.label}
                        </ThemedText>
                        {selected && (
                          <ThemedText type="default" style={{ color: Brand.onPrimary }}>
                            ✓
                          </ThemedText>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.three,
  },
  section: { gap: Spacing.one, marginBottom: Spacing.three },
  sectionTitle: { marginBottom: Spacing.one, marginLeft: Spacing.one },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
