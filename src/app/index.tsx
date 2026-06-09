import { Redirect } from 'expo-router';

import { useProfileStore } from '@/store/profile';

/**
 * Entry point. Sends the user to onboarding the first time, and straight to the
 * app once a profile exists.
 */
export default function Index() {
  const profile = useProfileStore((s) => s.profile);

  if (!profile) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
