import { createFeatureFlagsProvider } from '../utils/feature-flags/factory';

export default defineEventHandler(async () => {
  const provider = createFeatureFlagsProvider();
  const allFlags = await provider.getAllFlags();

  // Only expose flags the public client needs.
  // Internal/infrastructure flags are not returned to unauthenticated callers.
  const publicFlags: Record<string, boolean> = {};
  const PUBLIC_FLAG_KEYS = [
    'new-users',
    'stripe-integration',
    'profile-pictures',
  ];
  for (const key of PUBLIC_FLAG_KEYS) {
    if (key in allFlags) {
      publicFlags[key] = allFlags[key as keyof typeof allFlags] as boolean;
    }
  }
  return publicFlags;
});
