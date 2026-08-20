import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ConsentCheckbox from '~/components/gdpr/ConsentCheckbox.vue';

describe('ConsentCheckbox', () => {
  it('renders the checkbox input', async () => {
    const wrapper = await mountSuspended(ConsentCheckbox, {
      props: { modelValue: false },
    });
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  it('checkbox is unchecked when modelValue is false', async () => {
    const wrapper = await mountSuspended(ConsentCheckbox, {
      props: { modelValue: false },
    });
    const checkbox = wrapper.find<HTMLInputElement>('input[type="checkbox"]');
    expect(checkbox.element.checked).toBe(false);
  });

  it('checkbox is checked when modelValue is true', async () => {
    const wrapper = await mountSuspended(ConsentCheckbox, {
      props: { modelValue: true },
    });
    const checkbox = wrapper.find<HTMLInputElement>('input[type="checkbox"]');
    expect(checkbox.element.checked).toBe(true);
  });

  it('emits update:modelValue true when checkbox is toggled on', async () => {
    const wrapper = await mountSuspended(ConsentCheckbox, {
      props: { modelValue: false },
    });
    await wrapper.find('input[type="checkbox"]').setValue(true);
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);
  });

  it('emits update:modelValue false when checkbox is toggled off', async () => {
    const wrapper = await mountSuspended(ConsentCheckbox, {
      props: { modelValue: true },
    });
    await wrapper.find('input[type="checkbox"]').setValue(false);
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  it('has the correct id and aria attributes', async () => {
    const wrapper = await mountSuspended(ConsentCheckbox, {
      props: { modelValue: false },
    });
    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.attributes('id')).toBe('consent-checkbox');
    expect(checkbox.attributes('aria-describedby')).toBe('consent-description');
  });
});
