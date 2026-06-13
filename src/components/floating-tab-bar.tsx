import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Brand, Spacing } from '@/constants/theme';
import { useResolvedScheme } from '@/hooks/use-resolved-scheme';

/** Outline/filled Ionicons for each tab route. */
const ICONS: Record<string, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap }> = {
  index: { on: 'home', off: 'home-outline' },
  notes: { on: 'document-text', off: 'document-text-outline' },
  subjects: { on: 'book', off: 'book-outline' },
  profile: { on: 'person', off: 'person-outline' },
};

/** Routes that exist in the navigator but aren't shown in the bar. */
const HIDDEN_ROUTES = new Set(['quizzes']); // reached via the center "+" button

// Figma "Bottom Navigation" metrics.
const BAR_HEIGHT = 80;
const BAR_RADIUS = 24;
const FAB_SIZE = 48;
const NOTCH_HALF_WIDTH = 62; // Figma "FAB BG" is 124 wide…
const NOTCH_DEPTH = 31; // …and dips ~31px into the bar.

/**
 * The bar outline: a rounded rect with a smooth curved notch carved into the
 * top edge for the FAB to float in. Tangents are horizontal at the notch's
 * edges and bottom, so it blends into the flat top without corners.
 */
function barPath(w: number): string {
  const cx = w / 2;
  return [
    `M ${BAR_RADIUS} 0`,
    `H ${cx - NOTCH_HALF_WIDTH}`,
    `C ${cx - 34} 0 ${cx - 34} ${NOTCH_DEPTH} ${cx} ${NOTCH_DEPTH}`,
    `C ${cx + 34} ${NOTCH_DEPTH} ${cx + 34} 0 ${cx + NOTCH_HALF_WIDTH} 0`,
    `H ${w - BAR_RADIUS}`,
    `A ${BAR_RADIUS} ${BAR_RADIUS} 0 0 1 ${w} ${BAR_RADIUS}`,
    `V ${BAR_HEIGHT - BAR_RADIUS}`,
    `A ${BAR_RADIUS} ${BAR_RADIUS} 0 0 1 ${w - BAR_RADIUS} ${BAR_HEIGHT}`,
    `H ${BAR_RADIUS}`,
    `A ${BAR_RADIUS} ${BAR_RADIUS} 0 0 1 0 ${BAR_HEIGHT - BAR_RADIUS}`,
    `V ${BAR_RADIUS}`,
    `A ${BAR_RADIUS} ${BAR_RADIUS} 0 0 1 ${BAR_RADIUS} 0`,
    'Z',
  ].join(' ');
}

/**
 * Floating bottom navbar built to the Figma "Bottom Navigation" spec: an
 * 80px bar with 24px radius and a curved notch in the top edge, a 48px FAB
 * floating in the notch (centered on the bar's top edge), icon groups pushed
 * to the sides, and a glowing 12×2 line under the active icon. The Figma
 * purple accent is mapped to our brand blue.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const dark = useResolvedScheme() === 'dark';
  const [barWidth, setBarWidth] = useState(0);

  // Springy press feedback for the FAB.
  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }));

  // Figma: Neutral/White ↔ Neutral/Gray 90 bar, full-contrast inactive icons.
  const barBg = dark ? '#262626' : '#FFFFFF';
  const inactive = dark ? '#E0E0E0' : '#262626';
  const glow = dark ? Brand.primaryDark : Brand.primary;
  // The white bar vanishes against the light background (and Android has no
  // bar shadow), so outline it with the theme's border hairline in light mode.
  const barStroke = dark ? undefined : '#E6E8EC';

  // Split the visible routes evenly so the FAB can sit in the gap between them.
  const visible = state.routes.filter((r) => !HIDDEN_ROUTES.has(r.name));
  const mid = Math.ceil(visible.length / 2);
  const left = visible.slice(0, mid);
  const right = visible.slice(mid);

  function onPress(routeKey: string, routeName: string, focused: boolean) {
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(routeName);
  }

  const renderTab = (route: (typeof state.routes)[number]) => {
    const focused = state.routes[state.index].key === route.key;
    const icon = ICONS[route.name] ?? { on: 'ellipse', off: 'ellipse-outline' };
    return (
      <TabButton
        key={route.key}
        focused={focused}
        icon={icon}
        inactive={inactive}
        glow={glow}
        onPress={() => onPress(route.key, route.name, focused)}
      />
    );
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, Spacing.three) }]}>
      {/* Fixed-height block: bar pinned to the bottom, FAB pinned to the top,
          centered on the bar's top edge so it floats inside the notch. */}
      <View pointerEvents="box-none" style={styles.inner}>
        <View style={styles.bar} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
          {barWidth > 0 && (
            <Svg
              width={barWidth}
              height={BAR_HEIGHT}
              style={StyleSheet.absoluteFill}
              pointerEvents="none">
              <Path d={barPath(barWidth)} fill={barBg} stroke={barStroke} strokeWidth={1.5} />
            </Svg>
          )}
          <View style={styles.side}>{left.map(renderTab)}</View>
          <View style={styles.side}>{right.map(renderTab)}</View>
        </View>

        {/* "+" button floating in the notch — opens the Quizzes add form. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a quiz"
          onPress={() => navigation.navigate('quizzes', { new: Date.now() })}
          onPressIn={() => { fabScale.value = withSpring(0.88, { damping: 16, stiffness: 380 }); }}
          onPressOut={() => { fabScale.value = withSpring(1, { damping: 12, stiffness: 260 }); }}
          style={styles.fab}
          hitSlop={8}>
          <Animated.View style={[styles.fabCircle, fabStyle]}>
            <Ionicons name="add" size={24} color={Brand.onPrimary} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * One navbar tab: the icon springs up with a slight pop when it becomes
 * active, while the glowing indicator line fades and stretches in beneath it.
 */
function TabButton({
  focused,
  icon,
  inactive,
  glow,
  onPress,
}: {
  focused: boolean;
  icon: { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap };
  inactive: string;
  glow: string;
  onPress: () => void;
}) {
  const iconStyle = useAnimatedStyle(
    () => ({
      transform: [
        { scale: withSpring(focused ? 1.08 : 1, { damping: 14, stiffness: 260 }) },
        { translateY: withSpring(focused ? -1 : 0, { damping: 14, stiffness: 260 }) },
      ],
    }),
    [focused],
  );
  const lineStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
      transform: [{ scaleX: withTiming(focused ? 1 : 0.3, { duration: 200 }) }],
    }),
    [focused],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tab}
      hitSlop={12}>
      <Animated.View style={iconStyle}>
        <Ionicons name={focused ? icon.on : icon.off} size={24} color={focused ? Brand.primary : inactive} />
      </Animated.View>
      {/* Active indicator: 12×2 line, bottom corners rounded, soft glow up. */}
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: Brand.primary, boxShadow: `0 -12px 16px 2px ${glow}` },
          lineStyle,
        ]}
      />
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
  inner: {
    height: BAR_HEIGHT + FAB_SIZE / 2,
    justifyContent: 'flex-end',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: BAR_HEIGHT,
    paddingHorizontal: 40,
    // iOS shadows the composited content, so it follows the notched outline.
    // (Android elevation needs an opaque View background, so it's omitted.)
    shadowColor: '#0B1220',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  tab: {
    width: 24,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  indicator: {
    width: 12,
    height: 2,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  fab: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: FAB_SIZE,
    height: FAB_SIZE,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  fabCircle: {
    flex: 1,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.primary,
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});
