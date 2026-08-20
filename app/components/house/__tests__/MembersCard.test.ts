/**
 * MembersCard Component Tests
 *
 * Real mounts via mountSuspended — this file previously only asserted on
 * locally-declared constants without ever rendering the component. Covers:
 * remove-member visibility/authorization, the confirm-before-delete step,
 * the invite-by-email form, and the existing generate-invitation / role
 * change flows this component already owned.
 */
import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import MembersCard from '~/components/house/MembersCard.vue';
import type { HouseMember } from '~/types';

mockNuxtImport('useI18n', () => () => ({
  // Encode interpolation params into the returned string so tests can
  // assert on them (e.g. which member name a confirm dialog names)
  // without depending on real translated copy.
  t: (key: string, params?: Record<string, unknown>) =>
    params ? `${key}|${JSON.stringify(params)}` : key,
  locale: { value: 'en' },
}));

const G = {
  stubs: {
    Icon: true,
    UiUserAvatar: {
      template: '<div class="avatar" />',
      props: ['size', 'user'],
    },
    UiButton: {
      template:
        '<button class="ui-btn" :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
      props: ['variant', 'size', 'loading', 'disabled'],
      emits: ['click'],
    },
    UiConfirmModal: {
      template:
        '<div v-if="show" class="confirm-modal" :data-variant="confirmVariant"><p class="confirm-modal-title">{{ title }}</p><p class="confirm-modal-message">{{ message }}</p><button class="confirm-modal-confirm" @click="$emit(\'confirm\')">{{ confirmText }}</button><button class="confirm-modal-cancel" @click="$emit(\'cancel\')">{{ cancelText }}</button></div>',
      props: [
        'show',
        'title',
        'message',
        'confirmText',
        'cancelText',
        'loading',
        'confirmVariant',
      ],
      emits: ['confirm', 'cancel', 'close'],
    },
  },
};

const owner: HouseMember = {
  id: 'member-1',
  user_id: 'user-1',
  house_id: 'house-123',
  role: 'owner',
  is_active: true,
  joined_at: '2025-01-01T00:00:00Z',
  user: {
    id: 'user-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    created_at: '2025-01-01',
  },
};

const memberJane: HouseMember = {
  id: 'member-2',
  user_id: 'user-2',
  house_id: 'house-123',
  role: 'member',
  is_active: true,
  joined_at: '2025-01-15T00:00:00Z',
  user: {
    id: 'user-2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    created_at: '2025-01-15',
  },
};

const memberBob: HouseMember = {
  id: 'member-3',
  user_id: 'user-3',
  house_id: 'house-123',
  role: 'member',
  is_active: true,
  joined_at: '2025-02-01T00:00:00Z',
  user: {
    id: 'user-3',
    first_name: 'Bob',
    last_name: 'Johnson',
    email: 'bob@example.com',
    created_at: '2025-02-01',
  },
};

const allMembers = [owner, memberJane, memberBob];

const mount = (props: Record<string, unknown> = {}) =>
  mountSuspended(MembersCard, {
    props: { members: allMembers, ...props },
    global: G,
  });

/** Finds a rendered button whose aria-label contains the given substring —
 * avoids CSS attribute-selector quoting headaches around the JSON blob the
 * mocked t() encodes interpolation params into. */
const findByAriaLabel = (
  wrapper: Awaited<ReturnType<typeof mount>>,
  substr: string,
) =>
  wrapper
    .findAll('button')
    .find((b) => b.attributes('aria-label')?.includes(substr));

describe('House MembersCard Component', () => {
  it('renders', async () => {
    const wrapper = await mount();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays every member name', async () => {
    const wrapper = await mount();
    expect(wrapper.text()).toContain('John');
    expect(wrapper.text()).toContain('Jane');
    expect(wrapper.text()).toContain('Bob');
  });

  it('emits user-click with the member id when a row is clicked', async () => {
    const wrapper = await mount();
    const rows = wrapper.findAll('button');
    const janeRow = rows.find((r) => r.text().includes('Jane'));
    await janeRow?.trigger('click');
    expect(wrapper.emitted('user-click')?.[0]).toEqual(['user-2']);
  });

  describe('Remove-member control (authorization)', () => {
    it('hides the remove control entirely for a non-owner viewer', async () => {
      const wrapper = await mount({
        isCurrentUserOwner: false,
        currentUserId: 'user-2',
      });
      expect(
        findByAriaLabel(wrapper, 'a11y.buttons.removeMember'),
      ).toBeUndefined();
    });

    it("hides the remove control on the current owner's own row", async () => {
      const wrapper = await mount({
        isCurrentUserOwner: true,
        currentUserId: 'user-1',
      });
      const removeButtons = wrapper
        .findAll('button')
        .filter((b) =>
          b.attributes('aria-label')?.includes('a11y.buttons.removeMember'),
        );
      // Only Jane and Bob get a remove control; the owner's own row does not.
      expect(removeButtons).toHaveLength(2);
      expect(findByAriaLabel(wrapper, 'John Doe')).toBeUndefined();
    });

    it('shows the remove control for other members when viewer is owner', async () => {
      const wrapper = await mount({
        isCurrentUserOwner: true,
        currentUserId: 'user-1',
      });
      expect(findByAriaLabel(wrapper, 'Jane Smith')).toBeDefined();
    });
  });

  describe('Remove-member control (confirm-before-delete)', () => {
    it('does not emit remove-member until the confirmation is accepted', async () => {
      const wrapper = await mount({
        isCurrentUserOwner: true,
        currentUserId: 'user-1',
      });
      await findByAriaLabel(wrapper, 'Jane Smith')?.trigger('click');

      expect(wrapper.emitted('remove-member')).toBeFalsy();
      const modal = wrapper.find('.confirm-modal');
      expect(modal.exists()).toBe(true);
      expect(modal.find('.confirm-modal-message').text()).toContain(
        'Jane Smith',
      );
    });

    it('uses a danger-styled confirm button for the destructive action', async () => {
      const wrapper = await mount({
        isCurrentUserOwner: true,
        currentUserId: 'user-1',
      });
      await findByAriaLabel(wrapper, 'Jane Smith')?.trigger('click');
      expect(wrapper.find('.confirm-modal').attributes('data-variant')).toBe(
        'danger',
      );
    });

    it('emits remove-member with the correct user id once confirmed', async () => {
      const wrapper = await mount({
        isCurrentUserOwner: true,
        currentUserId: 'user-1',
      });
      await findByAriaLabel(wrapper, 'Jane Smith')?.trigger('click');
      await wrapper.find('.confirm-modal-confirm').trigger('click');

      expect(wrapper.emitted('remove-member')?.[0]).toEqual(['user-2']);
    });

    it('does not emit remove-member when the confirmation is cancelled', async () => {
      const wrapper = await mount({
        isCurrentUserOwner: true,
        currentUserId: 'user-1',
      });
      await findByAriaLabel(wrapper, 'Jane Smith')?.trigger('click');
      await wrapper.find('.confirm-modal-cancel').trigger('click');

      expect(wrapper.emitted('remove-member')).toBeFalsy();
      expect(wrapper.find('.confirm-modal').exists()).toBe(false);
    });
  });

  describe('Invite by email', () => {
    it('does not render the form when invitations are disabled', async () => {
      const wrapper = await mount({ enableInvitation: false });
      expect(wrapper.find('#house-invite-email').exists()).toBe(false);
    });

    it('renders the form alongside the generate-link button when enabled', async () => {
      const wrapper = await mount({ enableInvitation: true });
      expect(wrapper.find('#house-invite-email').exists()).toBe(true);
      expect(wrapper.text()).toContain('houseProfile.generateInvitation');
    });

    it('emits invite-member with the entered email on submit', async () => {
      const wrapper = await mount({ enableInvitation: true });
      await wrapper.find('#house-invite-email').setValue('friend@example.com');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('invite-member')?.[0]).toEqual([
        'friend@example.com',
      ]);
    });

    it('does not emit invite-member for an empty email', async () => {
      const wrapper = await mount({ enableInvitation: true });
      await wrapper.find('form').trigger('submit');
      expect(wrapper.emitted('invite-member')).toBeFalsy();
    });

    it('shows a loading state on the submit button while inviting', async () => {
      const wrapper = await mount({
        enableInvitation: true,
        inviteLoading: true,
      });
      const submitBtn = wrapper
        .findAll('.ui-btn')
        .find((b) => b.text().includes('houseProfile.inviteByEmailSubmit'));
      expect(submitBtn?.attributes('disabled')).toBeDefined();
    });
  });

  describe('Action error', () => {
    it('renders the action error as an alert', async () => {
      const wrapper = await mount({ actionError: 'User is already a member' });
      const alert = wrapper.find('[role="alert"]');
      expect(alert.exists()).toBe(true);
      expect(alert.text()).toContain('User is already a member');
    });

    it('renders no alert when there is no error', async () => {
      const wrapper = await mount({ actionError: null });
      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    });
  });

  describe('Generate invitation link (existing flow)', () => {
    it('shows the button when enabled and emits generate-invitation on click', async () => {
      const wrapper = await mount({ enableInvitation: true });
      const btn = wrapper
        .findAll('.ui-btn')
        .find((b) => b.text().includes('houseProfile.generateInvitation'));
      await btn?.trigger('click');
      expect(wrapper.emitted('generate-invitation')).toBeTruthy();
    });

    it('hides the button when disabled', async () => {
      const wrapper = await mount({ enableInvitation: false });
      const btn = wrapper
        .findAll('.ui-btn')
        .find((b) => b.text().includes('houseProfile.generateInvitation'));
      expect(btn).toBeUndefined();
    });
  });

  // The role menu is teleported to <body> to escape the card's overflow-hidden
  // clip, so it is not inside the wrapper's tree — query the document instead.
  const menuItems = () =>
    Array.from(document.querySelectorAll('[role="menuitem"]'));

  describe('Role change', () => {
    // Every role change is confirmed now, in both directions: promotion and
    // demotion both alter what someone can do to a shared ledger. Demotion
    // used to emit straight from the menu with no confirmation.
    it('does not emit until the change is confirmed', async () => {
      const wrapper = await mount({
        isCurrentUserOwner: true,
        currentUserId: 'user-1',
      });
      const roleBadge = wrapper.find('[aria-label="a11y.buttons.changeRole"]');
      await roleBadge.trigger('click');
      const adminOption = menuItems().find(
        (el) => el.textContent?.trim() === 'houseProfile.roleAdmin',
      );
      expect(adminOption).toBeDefined();
      adminOption!.dispatchEvent(new Event('click', { bubbles: true }));
      await nextTick();

      expect(wrapper.emitted('update-role')).toBeFalsy();
    });

    // 'owner' is unassignable: one owner per house, no transfer. The server
    // enum rejects it, so offering it in the menu guaranteed a 400.
    it('never offers the owner role in the menu', async () => {
      const wrapper = await mount({
        isCurrentUserOwner: true,
        currentUserId: 'user-1',
      });
      await wrapper
        .find('[aria-label="a11y.buttons.changeRole"]')
        .trigger('click');

      const labels = menuItems().map((el) => el.textContent?.trim());

      expect(labels).toContain('houseProfile.roleAdmin');
      expect(labels).toContain('houseProfile.roleMember');
      expect(labels).not.toContain('houseProfile.roleOwner');
    });
  });
});
