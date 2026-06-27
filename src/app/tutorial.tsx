import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ELLA } from '@/companions/companions';
import { Brand, Spacing, softShadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTourStore } from '@/store/tour';

/**
 * Shown once, right after onboarding: Ella offers a quick guided tour. Saying
 * yes drops the user into the app with the interactive walkthrough overlay
 * running (see TutorialOverlay); skipping goes straight to the dashboard. The
 * tour can always be replayed later from Settings.
 */
export default function Tutorial() {
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const startTour = useTourStore((s) => s.start);

  const figW = Math.min(232, Math.round(width * 0.58));
  const figH = Math.round(figW / (622 / 735));

  function takeTour() {
    startTour();
    router.replace('/(tabs)');
  }

  function skip() {
    router.replace('/(tabs)');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.wrap}>
          <Image source={ELLA.cheerful} style={{ width: figW, height: figH }} resizeMode="contain" />
          <ThemedText type="title" style={styles.center}>
            Quick tour?
          </ThemedText>
          <View style={[styles.bubble, { backgroundColor: theme.backgroundElement }, softShadow]}>
            <ThemedText type="smallBold" style={{ color: ELLA.color }}>
              {ELLA.name}
            </ThemedText>
            <ThemedText type="default" style={styles.line}>
              Gusto mo bang ituro ko sa&apos;yo kung paano gamitin ang Seatmate? Ipapakita ko lang kung saan ang bawat
              bagay. Mabilis lang, promise.
            </ThemedText>
          </View>
        </View>
        <View style={styles.footer}>
          <Pressable onPress={takeTour} style={[styles.cta, { backgroundColor: Brand.primary }, softShadow]}>
            <ThemedText type="default" style={styles.ctaText}>
              Sige, ituro mo
            </ThemedText>
          </Pressable>
          <Pressable onPress={skip} style={styles.skipBtn} hitSlop={8}>
            <ThemedText type="default" themeColor="textSecondary" style={styles.skipText}>
              Skip muna
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four },
  center: { textAlign: 'center' },
  bubble: { alignSelf: 'stretch', borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.two },
  line: { fontSize: 16, lineHeight: 24 },
  footer: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.three, gap: Spacing.two },
  cta: { borderRadius: Spacing.three, paddingVertical: Spacing.three, alignItems: 'center' },
  ctaText: { color: Brand.onPrimary, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: Spacing.two },
  skipText: { fontWeight: '600' },
});
