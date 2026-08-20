import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import EditModal from '~/components/expense/EditModal.vue';
import type { HouseMember } from '~/types';

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

const G = {
  mocks: { $t: (k: string) => k },
  stubs: {
    Icon: true,
    UiModal: {
      template:
        '<div v-if="show"><slot /><button class="close-btn" @click="$emit(\'close\')">X</button></div>',
      props: ['show', 'title'],
      emits: ['close'],
    },
    UiInput: {
      template:
        '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: [
        'id',
        'modelValue',
        'label',
        'placeholder',
        'type',
        'disabled',
        'required',
        'step',
        'min',
      ],
      emits: ['update:modelValue'],
    },
    UiSwitch: {
      template:
        '<button class="switch-btn" @click="$emit(\'update:modelValue\', !modelValue)"></button>',
      props: ['modelValue', 'disabled', 'size', 'ariaLabel'],
      emits: ['update:modelValue'],
    },
    UiButton: {
      template:
        '<button class="ui-btn" :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
      props: [
        'variant',
        'disabled',
        'loading',
        'icon',
        'fullWidth',
        'ariaLabel',
      ],
      emits: ['click'],
    },
  },
};

const mockUser = {
  id: 'u-1',
  first_name: 'Alice',
  last_name: 'Smith',
  email: 'alice@example.com',
  avatar_url: null,
};

function makeMember(userId: string, firstName: string): HouseMember {
  return {
    id: `m-${userId}`,
    house_id: 'h-1',
    user_id: userId,
    role: 'member',
    joined_at: '2025-01-01',
    is_active: true,
    user: {
      id: userId,
      first_name: firstName,
      last_name: 'User',
      email: `${userId}@example.com`,
      avatar_url: null,
    },
  };
}

describe('ExpenseEditModal', () => {
  it('renders nothing when show is false', async () => {
    const wrapper = await mountSuspended(EditModal, {
      props: { show: false, members: [], currentUser: mockUser },
      global: G,
    });
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('renders form when show is true', async () => {
    const wrapper = await mountSuspended(EditModal, {
      props: { show: true, members: [], currentUser: mockUser },
      global: G,
    });
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('emits close when modal close button is triggered', async () => {
    const wrapper = await mountSuspended(EditModal, {
      props: { show: true, members: [], currentUser: mockUser },
      global: G,
    });
    await wrapper.find('.close-btn').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('pre-selects currentUser on mount', async () => {
    const member = makeMember('u-1', 'Alice');
    const wrapper = await mountSuspended(EditModal, {
      props: { show: true, members: [member], currentUser: mockUser },
      global: G,
    });
    expect(wrapper.find('.switch-btn').exists()).toBe(true);
  });

  describe('toggleUserSelection', () => {
    it('adds user when switch toggled on', async () => {
      const member = makeMember('u-2', 'Bob');
      const wrapper = await mountSuspended(EditModal, {
        props: { show: true, members: [member], currentUser: mockUser },
        global: G,
      });
      await wrapper.find('.switch-btn').trigger('click');
      expect(wrapper.exists()).toBe(true);
    });

    it('removes user when switch toggled off for pre-selected user', async () => {
      const member = makeMember('u-1', 'Alice'); // pre-selected as currentUser
      const wrapper = await mountSuspended(EditModal, {
        props: { show: true, members: [member], currentUser: mockUser },
        global: G,
      });
      await wrapper.find('.switch-btn').trigger('click');
      expect(wrapper.exists()).toBe(true);
    });

    it('handles member with no user (undefined user.id)', async () => {
      const memberNoUser: HouseMember = {
        id: 'm-empty',
        house_id: 'h-1',
        user_id: '',
        role: 'member',
        joined_at: '2025-01-01',
        is_active: true,
      };
      const wrapper = await mountSuspended(EditModal, {
        props: { show: true, members: [memberNoUser], currentUser: mockUser },
        global: G,
      });
      await wrapper.find('.switch-btn').trigger('click');
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('handleSubmit', () => {
    it('emits submit with correct payload', async () => {
      const wrapper = await mountSuspended(EditModal, {
        props: { show: true, members: [], currentUser: mockUser },
        global: G,
      });
      const inputs = wrapper.findAll('input');
      await inputs[0].setValue('Rent');
      await inputs[1].setValue('600.00');

      const btns = wrapper.findAll('.ui-btn');
      await btns[btns.length - 1].trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')![0][0] as {
        description: string;
        total_amount: number;
        due_date?: string;
      };
      expect(payload.description).toBe('Rent');
      expect(payload.total_amount).toBe(600);
    });

    it('sets due_date to undefined when empty', async () => {
      const wrapper = await mountSuspended(EditModal, {
        props: { show: true, members: [], currentUser: mockUser },
        global: G,
      });
      const inputs = wrapper.findAll('input');
      await inputs[0].setValue('Gas');
      await inputs[1].setValue('80.00');
      // leave due_date empty
      const btns = wrapper.findAll('.ui-btn');
      await btns[btns.length - 1].trigger('click');

      const payload = wrapper.emitted('submit')![0][0] as { due_date?: string };
      expect(payload.due_date).toBeUndefined();
    });

    it('resets form after submit', async () => {
      const wrapper = await mountSuspended(EditModal, {
        props: { show: true, members: [], currentUser: mockUser },
        global: G,
      });
      const inputs = wrapper.findAll('input');
      await inputs[0].setValue('Internet');
      await inputs[1].setValue('45.00');
      const btns = wrapper.findAll('.ui-btn');
      await btns[btns.length - 1].trigger('click');
      expect(
        (wrapper.findAll('input')[0].element as HTMLInputElement).value,
      ).toBe('');
    });

    it('resets user_ids to empty when no currentUser after submit', async () => {
      const member = makeMember('u-other', 'Bob');
      const wrapper = await mountSuspended(EditModal, {
        props: { show: true, members: [member], currentUser: null },
        global: G,
      });
      await wrapper.find('.switch-btn').trigger('click');
      const inputs = wrapper.findAll('input');
      await inputs[0].setValue('Water');
      await inputs[1].setValue('20.00');
      const btns = wrapper.findAll('.ui-btn');
      await btns[btns.length - 1].trigger('click');
      expect(wrapper.emitted('submit')).toBeTruthy();
    });
  });

  it('renders multiple members in the list', async () => {
    const m1 = makeMember('u-1', 'Alice');
    const m2 = makeMember('u-2', 'Bob');
    const wrapper = await mountSuspended(EditModal, {
      props: { show: true, members: [m1, m2], currentUser: mockUser },
      global: G,
    });
    expect(wrapper.text()).toContain('Alice User');
    expect(wrapper.text()).toContain('Bob User');
  });
});
