import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ELLA } from '@/companions/companions';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Credit = { role: string; name: string; icon: keyof typeof Ionicons.glyphMap };

const CREDITS: Credit[] = [
  { role: 'Concept & development', name: 'Sagee', icon: 'code-slash-outline' },
  { role: 'Ella, character & art', name: 'Original artwork for Seatmate', icon: 'color-palette-outline' },
  { role: 'Built with', name: 'Expo · React Native', icon: 'logo-react' },
  { role: 'Icons', name: 'Ionicons', icon: 'sparkles-outline' },
];

export default function CreditsSettings() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.avatarRing, { borderColor: Brand.primary }]}>
            <Image source={ELLA.avatar} style={styles.avatar} resizeMode="cover" />
          </View>
          <ThemedText type="subtitle">Credits</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            Seatmate was made with care. Here are the people and tools behind it.
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          {CREDITS.map((c, i) => (
            <View key={c.role}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              <View style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: theme.background }]}>
                  <Ionicons name={c.icon} size={18} color={Brand.primary} />
                </View>
                <View style={styles.flex}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {c.role}
                  </ThemedText>
                  <ThemedText type="default" style={{ fontWeight: '600' }}>
                    {c.name}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Salamat sa pag-aaral kasama si Ella.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  hero: { alignItems: 'center', gap: Spacing.one, marginVertical: Spacing.three },
  avatarRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, padding: 3, marginBottom: Spacing.two },
  avatar: { width: '100%', height: '100%', borderRadius: 42 },
  center: { textAlign: 'center', paddingHorizontal: Spacing.four },
  card: { borderRadius: Spacing.four, padding: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.one },
  footer: { textAlign: 'center', marginTop: Spacing.two },
});
