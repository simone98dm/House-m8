import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { EnvProvider } from '../../utils/feature-flags/EnvProvider';
import { VercelEdgeConfigProvider } from '../../utils/feature-flags/VercelEdgeConfigProvider';
import { createFeatureFlagsProvider } from '../../utils/feature-flags/factory';

vi.mock('../../utils/feature-flags/EnvProvider', () => ({
  EnvProvider: vi.fn(function (this: unknown) {
    Object.assign(this as object, { _type: 'env' });
  }),
}));
vi.mock('../../utils/feature-flags/VercelEdgeConfigProvider', () => ({
  VercelEdgeConfigProvider: vi.fn(function (this: unknown) {
    Object.assign(this as object, { _type: 'vercel' });
  }),
}));

describe('createFeatureFlagsProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates EnvProvider when FEATURE_FLAGS_PROVIDER=env', () => {
    process.env.FEATURE_FLAGS_PROVIDER = 'env';
    createFeatureFlagsProvider();
    expect(EnvProvider).toHaveBeenCalledOnce();
    expect(VercelEdgeConfigProvider).not.toHaveBeenCalled();
  });

  it('creates EnvProvider by default when FEATURE_FLAGS_PROVIDER is not set', () => {
    delete process.env.FEATURE_FLAGS_PROVIDER;
    createFeatureFlagsProvider();
    expect(EnvProvider).toHaveBeenCalledOnce();
  });

  it('creates VercelEdgeConfigProvider when FEATURE_FLAGS_PROVIDER=vercel', () => {
    process.env.FEATURE_FLAGS_PROVIDER = 'vercel';
    createFeatureFlagsProvider();
    expect(VercelEdgeConfigProvider).toHaveBeenCalledOnce();
    expect(EnvProvider).not.toHaveBeenCalled();
  });

  it('throws on unknown provider value', () => {
    process.env.FEATURE_FLAGS_PROVIDER = 'configcat';
    expect(() => createFeatureFlagsProvider()).toThrow(
      'Unknown feature flags provider: configcat',
    );
  });
});
