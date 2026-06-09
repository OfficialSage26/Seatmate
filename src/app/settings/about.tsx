import Constants from 'expo-constants';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { COMPANIONS } from '@/companions/companions';
import { Brand, Spacing, Alpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AboutSettings() {
  const theme = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.logo, { backgroundColor: Brand.primary + Alpha.soft }]}>
            <ThemedText style={styles.logoEmoji}>🎓</ThemedText>
          </View>
          <ThemedText type="subtitle">Seatmate</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Version {version}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="default">
            Seatmate is your offline study buddy. Track your quizzes, subjects, and grades — with a
            virtual seatmate who keeps you company and cheers you on along the way.
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold">🔒 Private by design</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            No account, no cloud, no internet required. Everything you enter stays on this device.
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" style={{ marginBottom: Spacing.two }}>
            Your companions
          </ThemedText>
          <View style={styles.companions}>
            {COMPANIONS.map((c) => (
              <View key={c.id} style={styles.companion}>
                <View style={[styles.cAvatar, { backgroundColor: c.color + Alpha.soft }]}>
                  <ThemedText style={styles.cEmoji}>{c.emoji}</ThemedText>
                </View>
                <ThemedText type="small">{c.name}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Made with care for students. 💙
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  hero: { alignItems: 'center', gap: Spacing.one, marginVertical: Spacing.three },
  logo: { width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  logoEmoji: { fontSize: 44 },
  card: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.two },
  companions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, justifyContent: 'space-between' },
  companion: { alignItems: 'center', gap: Spacing.one, width: '22%' },
  cAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  cEmoji: { fontSize: 24 },
  footer: { textAlign: 'center', marginTop: Spacing.two },
});
