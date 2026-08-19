import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UiInput from '~/components/ui/Input.vue';

describe('UiInput', () => {
  it('renders an input element by default', () => {
    const wrapper = mount(UiInput);
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('renders textarea when type is textarea', () => {
    const wrapper = mount(UiInput, { props: { type: 'textarea' } });
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('renders label when provided', () => {
    const wrapper = mount(UiInput, { props: { label: 'Email address' } });
    expect(wrapper.text()).toContain('Email address');
  });

  it('renders hint when provided', () => {
    const wrapper = mount(UiInput, { props: { hint: 'Min 8 chars' } });
    expect(wrapper.text()).toContain('Min 8 chars');
  });

  it('binds modelValue to input', () => {
    const wrapper = mount(UiInput, { props: { modelValue: 'hello' } });
    expect(wrapper.find('input').element.value).toBe('hello');
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(UiInput);
    await wrapper.find('input').setValue('new value');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('is disabled when disabled prop is set', () => {
    const wrapper = mount(UiInput, { props: { disabled: true } });
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });

  it('sets placeholder attribute', () => {
    const wrapper = mount(UiInput, { props: { placeholder: 'Enter text...' } });
    expect(wrapper.find('input').attributes('placeholder')).toBe(
      'Enter text...',
    );
  });

  it('renders sm size classes', () => {
    const wrapper = mount(UiInput, { props: { size: 'sm' } });
    expect(wrapper.find('input').attributes('class')).toContain('text-sm');
  });

  it('renders lg size classes', () => {
    const wrapper = mount(UiInput, { props: { size: 'lg' } });
    expect(wrapper.find('input').attributes('class')).toContain('text-base');
  });

  it('renders required marker in label', () => {
    const wrapper = mount(UiInput, {
      props: { label: 'Name', required: true },
    });
    expect(wrapper.find('span').text()).toBe('*');
  });
});
