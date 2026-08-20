/**
 * Tests the PersonalInfo orchestrator: edit-mode toggling and save/cancel
 * delegation to its child components (Pictures / Form / View), after the
 * Phase 7 Smart/Dumb split. See PersonalInfoView.test.ts,
 * PersonalInfoPictures.test.ts and PersonalInfoForm.test.ts for the
 * extracted children's own behavior.
 */
import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import PersonalInfo from '~/components/user/profile/PersonalInfo.vue';
import { createMockUser } from '~/tests/utils';

const G = {
  mocks: { $t: (k: string) => k },
  stubs: {
    Icon: true,
    UserProfilePersonalInfoPictures: true,
    UserProfilePersonalInfoForm: true,
    UserProfilePersonalInfoView: true,
  },
};

describe('PersonalInfo', () => {
  it('starts in view mode', async () => {
    const wrapper = await mountSuspended(PersonalInfo, {
      props: { user: createMockUser() },
      global: G,
    });
    expect(
      wrapper.findComponent({ name: 'UserProfilePersonalInfoView' }).exists(),
    ).toBe(true);
    expect(
      wrapper.findComponent({ name: 'UserProfilePersonalInfoForm' }).exists(),
    ).toBe(false);
  });

  it('shows the edit button only for the own profile while in view mode', async () => {
    const wrapper = await mountSuspended(PersonalInfo, {
      props: { user: createMockUser(), isOwnProfile: true },
      global: G,
    });
    expect(wrapper.findComponent({ name: 'UiButton' }).exists()).toBe(true);
  });

  it('hides the edit button when not the own profile', async () => {
    const wrapper = await mountSuspended(PersonalInfo, {
      props: { user: createMockUser(), isOwnProfile: false },
      global: G,
    });
    expect(wrapper.findComponent({ name: 'UiButton' }).exists()).toBe(false);
  });

  it('switches to the form when the edit button is clicked', async () => {
    const wrapper = await mountSuspended(PersonalInfo, {
      props: { user: createMockUser(), isOwnProfile: true },
      global: G,
    });
    await wrapper.findComponent({ name: 'UiButton' }).trigger('click');
    expect(
      wrapper.findComponent({ name: 'UserProfilePersonalInfoForm' }).exists(),
    ).toBe(true);
    expect(
      wrapper.findComponent({ name: 'UserProfilePersonalInfoView' }).exists(),
    ).toBe(false);
  });

  it('emits save and returns to view mode when the form saves', async () => {
    const wrapper = await mountSuspended(PersonalInfo, {
      props: { user: createMockUser(), isOwnProfile: true },
      global: G,
    });
    await wrapper.findComponent({ name: 'UiButton' }).trigger('click');
    const form = wrapper.findComponent({
      name: 'UserProfilePersonalInfoForm',
    });
    form.vm.$emit('save', { first_name: 'Jane' });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('save')?.[0]).toEqual([{ first_name: 'Jane' }]);
    expect(
      wrapper.findComponent({ name: 'UserProfilePersonalInfoView' }).exists(),
    ).toBe(true);
  });

  it('bubbles up the save event emitted by the pictures component', async () => {
    const wrapper = await mountSuspended(PersonalInfo, {
      props: { user: createMockUser(), isOwnProfile: true },
      global: G,
    });
    const pictures = wrapper.findComponent({
      name: 'UserProfilePersonalInfoPictures',
    });
    pictures.vm.$emit('save', { profile_pictures: ['a.jpg'] });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('save')?.[0]).toEqual([
      { profile_pictures: ['a.jpg'] },
    ]);
  });
});
