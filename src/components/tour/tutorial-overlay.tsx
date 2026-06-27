/**
 * The interactive walkthrough overlay. Mounted once at the root, above the whole
 * app. When the tour is active it: navigates to the current step's tab, measures
 * the target element on screen, dims everything except a spotlight around it, and
 * shows Ella's instruction with Back / Next / Skip. Any tap also advances, so no
 * one gets stuck.
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { getTourTarget } from '@/components/tour/use-tour-target';
import { ThemedText } from '@/components/themed-text';
import { ELLA } from '@/companions/companions';
import { Brand, Spacing, softShadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TOUR_STEPS, useTourStore } from '@/store/tour';

const PAD = 8; // breathing room around the spotlighted element
const RADIUS = 14;
const GAP = 14; // gap between the spotlight and Ella's bubble
const SCRIM = 'rgba(8, 10, 14, 0.84)';

export function TutorialOverlay() {
  const theme = useTheme();
  const router = useRouter();
  const { height: screenH } = useWindowDimensions();

  const active = useTourStore((s) => s.active);
  const index = useTourStore((s) => s.index);
  const rect = useTourStore((s) => s.rect);
  const next = useTourStore((s) => s.next);
  const back = useTourStore((s) => s.back);
  const stop = useTourStore((s) => s.stop);
  const setRect = useTourStore((s) => s.setRect);

  // On each step: route to the right tab, then poll-measure the target until it
  // reports a real (non-zero) box. Polling rides out the tab transition + layout.
  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[index];
    router.navigate(step.route);

    let cancelled = false;
    let tries = 0;
    const tick = () => {
      if (cancelled) return;
      const node = getTourTarget(step.target)?.current;
      if (node) {
        node.measureInWindow((x, y, w, h) => {
          if (cancelled) return;
          if (w > 0 && h > 0) {
            setRect({ x, y, width: w, height: h });
          } else if (++tries < 30) {
            setTimeout(tick, 70);
          }
        });
      } else if (++tries < 30) {
        setTimeout(tick, 70);
      }
    };
    const id = setTimeout(tick, 140);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [active, index, router, setRect]);

  if (!active) return null;

  const step = TOUR_STEPS[index];
  const isLast = index >= TOUR_STEPS.length - 1;

  function advance() {
    if (isLast) {
      stop();
      router.navigate('/(tabs)'); // end on Home
    } else {
      next();
    }
  }

  // Spotlight geometry, clamped so panels never get negative sizes.
  const sx = rect ? Math.max(0, rect.x - PAD) : 0;
  const sy = rect ? Math.max(0, rect.y - PAD) : 0;
  const sw = rect ? rect.width + PAD * 2 : 0;
  const sh = rect ? rect.height + PAD * 2 : 0;

  // Put the bubble on the opposite side of the screen from the target.
  const placeBelow = rect ? rect.y < screenH * 0.5 : true;
  const bubblePos = placeBelow
    ? { top: (rect ? rect.y + rect.height : screenH * 0.42) + GAP }
    : { bottom: screenH - (rect ? rect.y : screenH * 0.58) + GAP };

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* Tap catcher behind the dim panels. Advances once a target is shown. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => rect && advance()} />

      {rect ? (
        <>
          <View pointerEvents="none" style={[styles.dim, { left: 0, top: 0, right: 0, height: sy }]} />
          <View pointerEvents="none" style={[styles.dim, { left: 0, top: sy + sh, right: 0, bottom: 0 }]} />
          <View pointerEvents="none" style={[styles.dim, { left: 0, top: sy, width: sx, height: sh }]} />
          <View pointerEvents="none" style={[styles.dim, { left: sx + sw, top: sy, right: 0, height: sh }]} />
          <View pointerEvents="none" style={[styles.ring, { left: sx, top: sy, width: sw, height: sh }]} />
        </>
      ) : (
        <View pointerEvents="none" style={[styles.dim, StyleSheet.absoluteFillObject]} />
      )}

      {/* Ella's instruction */}
      <View style={[styles.bubbleWrap, bubblePos]}>
        <View style={[styles.bubble, { backgroundColor: theme.backgroundElement }, softShadow]}>
          <View style={styles.head}>
            <Image source={ELLA.avatar} style={styles.avatar} resizeMode="cover" />
            <ThemedText type="smallBold" style={{ color: ELLA.color }}>
              {ELLA.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.counter}>
              {index + 1}/{TOUR_STEPS.length}
            </ThemedText>
          </View>
          <ThemedText type="default" style={styles.title}>
            {step.title}
          </ThemedText>
          <ThemedText type="default" style={styles.line}>
            {step.line}
          </ThemedText>
          <View style={styles.actions}>
            <Pressable onPress={stop} hitSlop={8} style={styles.skip}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.skipText}>
                Skip tour
              </ThemedText>
            </Pressable>
            <View style={styles.rightActions}>
              {index > 0 && (
                <Pressable onPress={back} hitSlop={8} style={styles.backBtn}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.backText}>
                    Back
                  </ThemedText>
                </Pressable>
              )}
              <Pressable onPress={advance} style={[styles.nextBtn, { backgroundColor: Brand.primary }]}>
                <ThemedText type="small" style={styles.nextText}>
                  {isLast ? 'Tapos na!' : 'Next'}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // High elevation/zIndex so the overlay sits above the floating tab bar.
  root: { ...StyleSheet.absoluteFillObject, zIndex: 1000, elevation: 1000 },
  dim: { position: 'absolute', backgroundColor: SCRIM },
  ring: {
    position: 'absolute',
    borderRadius: RADIUS,
    borderWidth: 2,
    borderColor: Brand.primary,
  },

  bubbleWrap: { position: 'absolute', left: Spacing.four, right: Spacing.four },
  bubble: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.two },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  avatar: { width: 26, height: 26, borderRadius: 13 },
  counter: { marginLeft: 'auto', fontWeight: '700' },
  title: { fontWeight: '800', fontSize: 17 },
  line: { fontSize: 15, lineHeight: 22 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.two },
  skip: { paddingVertical: Spacing.one },
  skipText: { fontWeight: '600' },
  rightActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  backBtn: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.two },
  backText: { fontWeight: '700' },
  nextBtn: { borderRadius: 999, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  nextText: { color: Brand.onPrimary, fontWeight: '700' },
});
