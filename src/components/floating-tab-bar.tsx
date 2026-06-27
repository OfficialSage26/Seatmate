import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTourTarget } from '@/components/tour/use-tour-target';
import { Brand, Spacing } from '@/constants/theme';
import { useResolvedScheme } from '@/hooks/use-resolved-scheme';

type TabMeta = {
  on: keyof typeof Ionicons.glyphMap;
  off: keyof typeof Ionicons.glyphMap;
  label: string;
  /** Tour registry id, so the walkthrough can spotlight this tab. */
  tour: string;
};

/** Outline/filled icon + label for each tab route, keyed by route name. */
const TABS: Record<string, TabMeta> = {
  index: { on: 'home', off: 'home-outline', label: 'Home', tour: 'tab-home' },
  notes: { on: 'document-text', off: 'document-text-outline', label: 'Notes', tour: 'tab-notes' },
  subjects: { on: 'book', off: 'book-outline', label: 'Subjects', tour: 'tab-subjects' },
  quizzes: { on: 'clipboard', off: 'clipboard-outline', label: 'Quizzes', tour: 'tab-quizzes' },
  profile: { on: 'settings', off: 'settings-outline', label: 'Settings', tour: 'tab-settings' },
};

// Bar metrics — a single rounded pill that floats above the bottom inset.
const BAR_HEIGHT = 64;
const BAR_RADIUS = 24;

/**
 * Floating bottom navbar: one rounded pill holding five evenly-spaced tabs,
 * each an icon + label that springs up and tints to the brand color when
 * active. No center FAB — Quizzes is now a first-class tab, and adding a quiz
 * lives on that screen's own header.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const dark = useResolvedScheme() === 'dark';

  const barBg = dark ? '#1A1C22' : '#FFFFFF';
  const inactive = dark ? '#9BA1AC' : '#8A909C';
  // The white bar can vanish against a light background (Android has no
  // shadow), so outline it with a hairline border in light mode.
  const barBorder = dark ? '#2A2D36' : '#E6E8EC';

  function onPress(routeKey: string, routeName: string, focused: boolean) {
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(routeName);
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, Spacing.three) }]}>
      <View style={[styles.bar, { backgroundColor: barBg, borderColor: barBorder }]}>
        {state.routes.map((route) => {
          const tab = TABS[route.name];
          if (!tab) return null; // any route not in TABS stays out of the bar
          const focused = state.routes[state.index].key === route.key;
          return (
            <TabButton
              key={route.key}
              focused={focused}
              tab={tab}
              inactive={inactive}
              onPress={() => onPress(route.key, route.name, focused)}
            />
          );
        })}
      </View>
    </View>
  );
}

/**
 * One navbar tab: icon + label. On activation the icon pops up slightly and
 * both icon and label cross-fade to the brand color, so the active tab reads
 * clearly without a heavy pill behind it.
 */
function TabButton({
  focused,
  tab,
  inactive,
  onPress,
}: {
  focused: boolean;
  tab: TabMeta;
  inactive: string;
  onPress: () => void;
}) {
  const tourRef = useTourTarget(tab.tour);
  const iconStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: withSpring(focused ? -2 : 0, { damping: 14, stiffness: 260 }) }],
    }),
    [focused],
  );
  const dotStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(focused ? 1 : 0, { duration: 180 }),
      transform: [{ scale: withTiming(focused ? 1 : 0.4, { duration: 180 }) }],
    }),
    [focused],
  );
  const color = focused ? Brand.primary : inactive;

  return (
    <Pressable
      ref={tourRef}
      collapsable={false}
      accessibilityRole="button"
      accessibilityLabel={tab.label}
      accessibilityState={focused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tab}
      hitSlop={8}>
      <Animated.View style={iconStyle}>
        <Ionicons name={focused ? tab.on : tab.off} size={23} color={color} />
      </Animated.View>
      <ThemedText style={[styles.label, { color }]} numberOfLines={1}>
        {tab.label}
      </ThemedText>
      <Animated.View style={[styles.dot, { backgroundColor: Brand.primary }, dotStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.four,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.two,
    // iOS/web soft shadow; Android uses elevation on the opaque bar.
    shadowColor: '#0B1220',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tab: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  label: { fontSize: 11, lineHeight: 13, fontWeight: '600' },
  dot: { position: 'absolute', bottom: 8, width: 4, height: 4, borderRadius: 2 },
});
