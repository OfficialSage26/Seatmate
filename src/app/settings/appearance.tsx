import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Spacing } from '@/constants/theme';
import type { ThemePref } from '@/db/repositories/settings';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/settings';

const OPTIONS: { value: ThemePref; label: string; emoji: string; hint: string }[] = [
  { value: 'system', label: 'System', emoji: '📱', hint: 'Match your device setting' },
  { value: 'light', label: 'Light', emoji: '☀️', hint: 'Always light' },
  { value: 'dark', label: 'Dark', emoji: '🌙', hint: 'Always dark' },
];

export default function AppearanceSettings() {
  const theme = useTheme();
  const pref = useSettingsStore((s) => s.themePref);
  const setPref = useSettingsStore((s) => s.setThemePref);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          Choose how Seatmate looks. Changes apply instantly.
        </ThemedText>

        <View style={styles.group}>
          {OPTIONS.map((o) => {
            const selected = pref === o.value;
            return (
              <Pressable
                key={o.value}
                onPress={() => setPref(o.value)}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: selected ? Brand.primary : 'transparent',
                  },
                ]}>
                <View style={[styles.emojiWrap, { backgroundColor: theme.background }]}>
                  <ThemedText style={styles.emoji}>{o.emoji}</ThemedText>
                </View>
                <View style={styles.flex}>
                  <ThemedText type="default" style={{ fontWeight: '700' }}>
                    {o.label}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {o.hint}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.radio,
                    { borderColor: selected ? Brand.primary : theme.backgroundSelected },
                  ]}>
                  {selected && <View style={[styles.radioDot, { backgroundColor: Brand.primary }]} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  group: { gap: Spacing.two },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    borderWidth: 2,
  },
  emojiWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  flex: { flex: 1 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
});
