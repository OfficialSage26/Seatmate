import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ELLA } from '@/companions/companions';
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
            <Ionicons name="school" size={44} color={Brand.primary} />
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
          <ThemedText type="smallBold">
            <Ionicons name="lock-closed" size={13} color={theme.text} /> Private by design
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            No account, no cloud, no internet required. Everything you enter stays on this device.
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" style={{ marginBottom: Spacing.two }}>
            Your seatmate
          </ThemedText>
          <View style={styles.seatmate}>
            <Image source={ELLA.portrait} style={[styles.cAvatar, { backgroundColor: ELLA.color + Alpha.soft }]} />
            <View style={styles.flex}>
              <ThemedText type="default" style={{ color: ELLA.color, fontWeight: '700' }}>
                {ELLA.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {ELLA.tagline}
              </ThemedText>
            </View>
          </View>
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Made with care for students.
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
  card: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.two },
  seatmate: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flex: { flex: 1 },
  cAvatar: { width: 48, height: 48, borderRadius: 24 },
  footer: { textAlign: 'center', marginTop: Spacing.two },
});
