import type { IFeatureFlagsProvider } from './IFeatureFlagsProvider';
import { EnvProvider } from './EnvProvider';
import { VercelEdgeConfigProvider } from './VercelEdgeConfigProvider';

export function createFeatureFlagsProvider(): IFeatureFlagsProvider {
  const provider = process.env.FEATURE_FLAGS_PROVIDER ?? 'env';

  switch (provider) {
    case 'env':
      return new EnvProvider();
    case 'vercel':
      return new VercelEdgeConfigProvider();
    default:
      throw new Error(`Unknown feature flags provider: ${provider}`);
  }
}
