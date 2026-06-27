/**
 * A tiny module-level registry that maps a tour step id to the View ref of the
 * element it should spotlight. Components mark themselves with `useTourTarget`;
 * the TutorialOverlay looks the ref up by id and measures it on screen.
 *
 * Kept outside React state on purpose: the overlay pulls a ref on demand (after
 * navigating to the right tab), so there's nothing to re-render here.
 */

import { useEffect, useRef } from 'react';
import type { View } from 'react-native';

type TargetRef = { current: View | null };

const registry = new Map<string, TargetRef>();

export function getTourTarget(id: string): TargetRef | undefined {
  return registry.get(id);
}

/**
 * Attach the returned ref to the element you want the tour to highlight, e.g.
 * `<Pressable ref={useTourTarget('subjects-add')} collapsable={false}>`. The
 * `collapsable={false}` matters on Android so the view can be measured.
 */
export function useTourTarget(id: string) {
  const ref = useRef<View | null>(null);
  useEffect(() => {
    registry.set(id, ref);
    return () => {
      if (registry.get(id) === ref) registry.delete(id);
    };
  }, [id]);
  return ref;
}
