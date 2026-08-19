import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import UserAvatar from '~/components/ui/UserAvatar.vue';

const makeUser = (firstName: string, lastName: string) => ({
  id: 'u-1',
  first_name: firstName,
  last_name: lastName,
  email: 'test@example.com',
  avatar_url: null,
});

describe('UserAvatar', () => {
  it('shows ? when no user is provided', async () => {
    const wrapper = await mountSuspended(UserAvatar, { props: { user: null } });
    expect(wrapper.text().trim()).toBe('?');
  });

  it('shows initials for full name', async () => {
    const wrapper = await mountSuspended(UserAvatar, {
      props: { user: makeUser('John', 'Doe') },
    });
    expect(wrapper.text().trim()).toBe('JD');
  });

  it('shows only first initial when last name is empty', async () => {
    const wrapper = await mountSuspended(UserAvatar, {
      props: { user: makeUser('John', '') },
    });
    expect(wrapper.text().trim()).toBe('J');
  });

  it('shows only last initial when first name is empty', async () => {
    const wrapper = await mountSuspended(UserAvatar, {
      props: { user: makeUser('', 'Doe') },
    });
    expect(wrapper.text().trim()).toBe('D');
  });

  it('renders with sm size class', async () => {
    const wrapper = await mountSuspended(UserAvatar, {
      props: { user: makeUser('A', 'B'), size: 'sm' },
    });
    expect(wrapper.html()).toContain('w-8');
  });

  it('renders with md size class (default)', async () => {
    const wrapper = await mountSuspended(UserAvatar, {
      props: { user: makeUser('A', 'B') },
    });
    expect(wrapper.html()).toContain('w-10');
  });

  it('renders with lg size class', async () => {
    const wrapper = await mountSuspended(UserAvatar, {
      props: { user: makeUser('A', 'B'), size: 'lg' },
    });
    expect(wrapper.html()).toContain('w-12');
  });

  it('adds role=img when ariaLabel is provided', async () => {
    const wrapper = await mountSuspended(UserAvatar, {
      props: { user: makeUser('J', 'D'), ariaLabel: 'John Doe avatar' },
    });
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('John Doe avatar');
  });

  it('does not add role when ariaLabel is not provided', async () => {
    const wrapper = await mountSuspended(UserAvatar, {
      props: { user: makeUser('J', 'D') },
    });
    expect(wrapper.attributes('role')).toBeUndefined();
  });

  it('uppercases initials', async () => {
    const wrapper = await mountSuspended(UserAvatar, {
      props: { user: makeUser('alice', 'bob') },
    });
    expect(wrapper.text().trim()).toBe('AB');
  });
});
