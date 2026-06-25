import { Redirect, Tabs } from 'expo-router';
import { Easing } from 'react-native';

import { FloatingTabBar } from '@/components/floating-tab-bar';
import { useProfileStore } from '@/store/profile';

export default function TabsLayout() {
  const profile = useProfileStore((s) => s.profile);

  // After "Erase all data" the profile becomes null while the tabs are still
  // mounted. Redirect out before any child screen reads profile and crashes.
  if (!profile) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Cross-fade + directional slide between tabs: the incoming page
        // drifts in from the side you're heading toward while fading up.
        animation: 'shift',
        transitionSpec: {
          animation: 'timing',
          config: { duration: 260, easing: Easing.bezier(0.4, 0, 0.2, 1) },
        },
        sceneStyleInterpolator: ({ current }) => ({
          sceneStyle: {
            opacity: current.progress.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0, 1, 0],
            }),
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [32, 0, -32],
                }),
              },
            ],
          },
        }),
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="notes" options={{ title: 'Notes' }} />
      <Tabs.Screen name="subjects" options={{ title: 'Subjects' }} />
      <Tabs.Screen name="quizzes" options={{ title: 'Quizzes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
