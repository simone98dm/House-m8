import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { defineComponent } from 'vue';
import { useAccountSetupNameStep } from '~/composables/useAccountSetupNameStep';
import { useUserApi } from '~/composables/useUserApi';

vi.mock('~/composables/useUserApi', () => ({ useUserApi: vi.fn() }));

async function setup(setNameAndPassword: ReturnType<typeof vi.fn>) {
  vi.mocked(useUserApi).mockReturnValue({
    setNameAndPassword,
  } as unknown as ReturnType<typeof useUserApi>);

  let api!: ReturnType<typeof useAccountSetupNameStep>;
  const Host = defineComponent({
    template: '<div />',
    setup() {
      api = useAccountSetupNameStep();
      return {};
    },
  });

  await mountSuspended(Host);
  return api;
}

describe('useAccountSetupNameStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts invalid with empty fields', async () => {
    const api = await setup(vi.fn());
    expect(api.isStep1Valid.value).toBe(false);
  });

  it('is invalid when the password is under 8 characters', async () => {
    const api = await setup(vi.fn());
    api.firstName.value = 'John';
    api.lastName.value = 'Doe';
    api.password.value = 'short';
    expect(api.isStep1Valid.value).toBe(false);
  });

  it('is valid once first name, last name and an 8+ char password are set', async () => {
    const api = await setup(vi.fn());
    api.firstName.value = 'John';
    api.lastName.value = 'Doe';
    api.password.value = 'password123';
    expect(api.isStep1Valid.value).toBe(true);
  });

  it('submits trimmed values and returns true on success', async () => {
    const setNameAndPassword = vi.fn().mockResolvedValue({ success: true });
    const api = await setup(setNameAndPassword);
    api.firstName.value = '  John  ';
    api.lastName.value = '  Doe  ';
    api.password.value = 'password123';

    const ok = await api.handleStep1();

    expect(ok).toBe(true);
    expect(setNameAndPassword).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
    });
    expect(api.step1Error.value).toBe('');
  });

  it('sets a generic error and returns false when the API returns null', async () => {
    const setNameAndPassword = vi.fn().mockResolvedValue(null);
    const api = await setup(setNameAndPassword);

    const ok = await api.handleStep1();

    expect(ok).toBe(false);
    expect(api.step1Error.value).toBe(
      'Could not save your profile. Please try again.',
    );
  });

  it('sets a generic error and returns false when the API call throws', async () => {
    const setNameAndPassword = vi.fn().mockRejectedValue(new Error('boom'));
    const api = await setup(setNameAndPassword);

    const ok = await api.handleStep1();

    expect(ok).toBe(false);
    expect(api.step1Error.value).toBe(
      'Could not save your profile. Please try again.',
    );
  });

  it('clears step1Loading after the call settles', async () => {
    const setNameAndPassword = vi.fn().mockResolvedValue({ success: true });
    const api = await setup(setNameAndPassword);

    const promise = api.handleStep1();
    expect(api.step1Loading.value).toBe(true);
    await promise;
    expect(api.step1Loading.value).toBe(false);
  });
});
