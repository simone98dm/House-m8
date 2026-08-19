import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getAll, get } from '@vercel/edge-config';
import { VercelEdgeConfigProvider } from '../../utils/feature-flags/VercelEdgeConfigProvider';

vi.mock('@vercel/edge-config', () => ({
  getAll: vi.fn(),
  get: vi.fn(),
}));

describe('VercelEdgeConfigProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllFlags', () => {
    it('returns all flags from Edge Config', async () => {
      vi.mocked(getAll).mockResolvedValue({
        'stripe-integration': true,
        'max-users': 5,
      });
      const provider = new VercelEdgeConfigProvider();
      expect(await provider.getAllFlags()).toEqual({
        'stripe-integration': true,
        'max-users': 5,
      });
    });

    it('returns empty object when Edge Config returns nothing', async () => {
      vi.mocked(getAll).mockResolvedValue({});
      const provider = new VercelEdgeConfigProvider();
      expect(await provider.getAllFlags()).toEqual({});
    });

    it('returns empty object and logs warning when Edge Config throws', async () => {
      vi.mocked(getAll).mockRejectedValue(new Error('network error'));
      const provider = new VercelEdgeConfigProvider();
      expect(await provider.getAllFlags()).toEqual({});
    });
  });

  describe('getFlag', () => {
    it('returns the flag value from Edge Config', async () => {
      vi.mocked(get).mockResolvedValue(true);
      const provider = new VercelEdgeConfigProvider();
      expect(await provider.getFlag('stripe-integration', false)).toBe(true);
    });

    it('returns defaultValue when Edge Config returns undefined', async () => {
      vi.mocked(get).mockResolvedValue(undefined);
      const provider = new VercelEdgeConfigProvider();
      expect(await provider.getFlag('missing-flag', false)).toBe(false);
    });

    it('returns defaultValue when Edge Config throws', async () => {
      vi.mocked(get).mockRejectedValue(new Error('network error'));
      const provider = new VercelEdgeConfigProvider();
      expect(await provider.getFlag('missing-flag', 'fallback')).toBe(
        'fallback',
      );
    });
  });
});
