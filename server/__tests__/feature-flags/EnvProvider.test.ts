/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnvProvider } from '../../utils/feature-flags/EnvProvider';

describe('EnvProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getAllFlags', () => {
    it('returns empty object when no FEATURE_FLAG_ vars are set', async () => {
      for (const key of Object.keys(process.env)) {
        if (key.startsWith('FEATURE_FLAG_')) delete process.env[key];
      }
      const provider = new EnvProvider();
      expect(await provider.getAllFlags()).toEqual({});
    });

    it('parses boolean true', async () => {
      process.env.FEATURE_FLAG_STRIPE_INTEGRATION = 'true';
      const provider = new EnvProvider();
      expect((await provider.getAllFlags())['stripe-integration']).toBe(true);
    });

    it('parses boolean false', async () => {
      process.env.FEATURE_FLAG_STRIPE_INTEGRATION = 'false';
      const provider = new EnvProvider();
      expect((await provider.getAllFlags())['stripe-integration']).toBe(false);
    });

    it('parses integer value', async () => {
      process.env.FEATURE_FLAG_MAX_USERS = '10';
      const provider = new EnvProvider();
      expect((await provider.getAllFlags())['max-users']).toBe(10);
    });

    it('parses float value', async () => {
      process.env.FEATURE_FLAG_RATIO = '0.5';
      const provider = new EnvProvider();
      expect((await provider.getAllFlags())['ratio']).toBe(0.5);
    });

    it('keeps string values as-is', async () => {
      process.env.FEATURE_FLAG_EXPERIMENT = 'variant-a';
      const provider = new EnvProvider();
      expect((await provider.getAllFlags())['experiment']).toBe('variant-a');
    });

    it('ignores vars without FEATURE_FLAG_ prefix', async () => {
      process.env.OTHER_VAR = 'value';
      for (const key of Object.keys(process.env)) {
        if (key.startsWith('FEATURE_FLAG_')) delete process.env[key];
      }
      const provider = new EnvProvider();
      expect(Object.keys(await provider.getAllFlags())).toHaveLength(0);
    });

    it('transforms multi-word key correctly', async () => {
      process.env.FEATURE_FLAG_MY_COOL_FLAG = 'true';
      const provider = new EnvProvider();
      const flags = await provider.getAllFlags();
      expect(flags['my-cool-flag']).toBe(true);
    });
  });

  describe('getFlag', () => {
    it('returns flag value when flag is set', async () => {
      process.env.FEATURE_FLAG_STRIPE_INTEGRATION = 'true';
      const provider = new EnvProvider();
      expect(await provider.getFlag('stripe-integration', false)).toBe(true);
    });

    it('returns defaultValue when flag is not set', async () => {
      for (const key of Object.keys(process.env)) {
        if (key.startsWith('FEATURE_FLAG_')) delete process.env[key];
      }
      const provider = new EnvProvider();
      expect(await provider.getFlag('missing-flag', false)).toBe(false);
    });

    it('returns string defaultValue when flag is not set', async () => {
      for (const key of Object.keys(process.env)) {
        if (key.startsWith('FEATURE_FLAG_')) delete process.env[key];
      }
      const provider = new EnvProvider();
      expect(await provider.getFlag('missing-flag', 'control')).toBe('control');
    });
  });
});
