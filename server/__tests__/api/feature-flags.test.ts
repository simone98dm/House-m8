/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createFeatureFlagsProvider } from '~~/server/utils/feature-flags/factory';

vi.stubGlobal(
  'defineEventHandler',
  (fn: (...args: unknown[]) => unknown) => fn,
);

vi.mock('~~/server/utils/feature-flags/factory', () => ({
  createFeatureFlagsProvider: vi.fn(),
}));

describe('GET /api/feature-flags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns public flags that are present in provider', async () => {
    vi.mocked(createFeatureFlagsProvider).mockReturnValue({
      getAllFlags: vi.fn().mockResolvedValue({ 'stripe-integration': true }),
      getFlag: vi.fn(),
    });

    const { default: handler } = await import('../../api/feature-flags.get');
    const result = await (handler as Function)({});

    expect(result).toEqual({ 'stripe-integration': true });
  });

  it('calls getAllFlags on the provider', async () => {
    const mockGetAllFlags = vi.fn().mockResolvedValue({});
    vi.mocked(createFeatureFlagsProvider).mockReturnValue({
      getAllFlags: mockGetAllFlags,
      getFlag: vi.fn(),
    });

    const { default: handler } = await import('../../api/feature-flags.get');
    await (handler as Function)({});

    expect(mockGetAllFlags).toHaveBeenCalledOnce();
  });

  it('returns empty object when provider returns no flags', async () => {
    vi.mocked(createFeatureFlagsProvider).mockReturnValue({
      getAllFlags: vi.fn().mockResolvedValue({}),
      getFlag: vi.fn(),
    });

    const { default: handler } = await import('../../api/feature-flags.get');
    const result = await (handler as Function)({});

    expect(result).toEqual({});
  });

  it('returns profile-pictures flag when present in provider', async () => {
    vi.mocked(createFeatureFlagsProvider).mockReturnValue({
      getAllFlags: vi.fn().mockResolvedValue({ 'profile-pictures': true }),
      getFlag: vi.fn(),
    });

    const { default: handler } = await import('../../api/feature-flags.get');
    const result = await (handler as Function)({});

    expect(result).toEqual({ 'profile-pictures': true });
  });

  it('omits profile-pictures flag when provider does not return it', async () => {
    vi.mocked(createFeatureFlagsProvider).mockReturnValue({
      getAllFlags: vi.fn().mockResolvedValue({ 'stripe-integration': true }),
      getFlag: vi.fn(),
    });

    const { default: handler } = await import('../../api/feature-flags.get');
    const result = await (handler as Function)({});

    expect(result).toEqual({ 'stripe-integration': true });
    expect(result).not.toHaveProperty('profile-pictures');
  });

  it('omits internal/non-public flags from the response', async () => {
    vi.mocked(createFeatureFlagsProvider).mockReturnValue({
      getAllFlags: vi.fn().mockResolvedValue({
        'internal-billing-flag': true,
        'stripe-integration': true,
      }),
      getFlag: vi.fn(),
    });

    const { default: handler } = await import('../../api/feature-flags.get');
    const result = await (handler as Function)({});

    expect(result).toEqual({ 'stripe-integration': true });
    expect(result).not.toHaveProperty('internal-billing-flag');
  });
});
