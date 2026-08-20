import { describe, it, expect, beforeEach } from 'vitest';
import { useFeatureFlags } from '../useFeatureFlags';

describe('useFeatureFlags', () => {
  beforeEach(() => {
    const { flags } = useFeatureFlags();
    flags.value = {};
  });

  describe('isEnabled', () => {
    it('returns true for a boolean true flag', () => {
      const { flags, isEnabled } = useFeatureFlags();
      flags.value = { 'stripe-integration': true };
      expect(isEnabled('stripe-integration')).toBe(true);
    });

    it('returns false for a boolean false flag', () => {
      const { flags, isEnabled } = useFeatureFlags();
      flags.value = { 'stripe-integration': false };
      expect(isEnabled('stripe-integration')).toBe(false);
    });

    it('returns false for an unknown flag key', () => {
      const { flags, isEnabled } = useFeatureFlags();
      flags.value = {};
      expect(isEnabled('nonexistent-flag')).toBe(false);
    });

    it('returns true for a truthy non-boolean flag value', () => {
      const { flags, isEnabled } = useFeatureFlags();
      flags.value = { variant: 'enabled' };
      expect(isEnabled('variant')).toBe(true);
    });
  });

  describe('getFlag', () => {
    it('returns boolean flag value', () => {
      const { flags, getFlag } = useFeatureFlags();
      flags.value = { 'stripe-integration': true };
      expect(getFlag('stripe-integration', false)).toBe(true);
    });

    it('returns string flag value', () => {
      const { flags, getFlag } = useFeatureFlags();
      flags.value = { experiment: 'variant-a' };
      expect(getFlag('experiment', 'control')).toBe('variant-a');
    });

    it('returns numeric flag value', () => {
      const { flags, getFlag } = useFeatureFlags();
      flags.value = { 'max-users': 10 };
      expect(getFlag('max-users', 0)).toBe(10);
    });

    it('returns defaultValue when flag key is absent', () => {
      const { flags, getFlag } = useFeatureFlags();
      flags.value = {};
      expect(getFlag('missing-flag', 42)).toBe(42);
    });

    it('returns false (not defaultValue) when flag is explicitly set to false', () => {
      const { flags, getFlag } = useFeatureFlags();
      flags.value = { 'stripe-integration': false };
      expect(getFlag('stripe-integration', true)).toBe(false);
    });
  });

  describe('flags', () => {
    it('exposes the raw reactive flags state', () => {
      const { flags } = useFeatureFlags();
      flags.value = { 'stripe-integration': true };
      expect(flags.value).toEqual({ 'stripe-integration': true });
    });
  });
});
