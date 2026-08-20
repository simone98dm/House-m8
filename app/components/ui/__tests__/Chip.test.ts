import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import UiChip from '~/components/ui/Chip.vue';

describe('UiChip', () => {
  it('renders label', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Active' },
    });
    expect(wrapper.text()).toContain('Active');
  });

  it('renders default variant classes', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Tag' },
    });
    expect(wrapper.find('span').attributes('class')).toContain('bg-gray-100');
  });

  it('renders primary variant', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Tag', variant: 'primary' },
    });
    expect(wrapper.find('span').attributes('class')).toContain(
      'bg-[var(--primary-subtle)]',
    );
  });

  it('renders success variant', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'OK', variant: 'success' },
    });
    expect(wrapper.find('span').attributes('class')).toContain(
      'bg-[var(--success-subtle)]',
    );
  });

  it('renders danger variant', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Error', variant: 'danger' },
    });
    expect(wrapper.find('span').attributes('class')).toContain(
      'bg-[var(--danger-subtle)]',
    );
  });

  it('renders selected state', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Tag', selected: true },
    });
    expect(wrapper.find('span').attributes('class')).toContain('bg-gray-200');
  });

  it('renders sm size', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Tag', size: 'sm' },
    });
    expect(wrapper.find('span').attributes('class')).toContain('text-xs');
  });

  it('renders lg size', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Tag', size: 'lg' },
    });
    expect(wrapper.find('span').attributes('class')).toContain('text-base');
  });

  it('emits click when selectable', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Tag', selectable: true },
    });
    await wrapper.find('span').trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click when not selectable', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Tag', selectable: false },
    });
    await wrapper.find('span').trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('renders remove button when removable', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Tag', removable: true },
    });
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('emits remove when remove button clicked', async () => {
    const wrapper = await mountSuspended(UiChip, {
      props: { label: 'Tag', removable: true },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('remove')).toBeTruthy();
  });
});
