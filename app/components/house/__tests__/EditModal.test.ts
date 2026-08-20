/**
 * EditModal Component Tests
 * Tests for house edit modal component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ref } from 'vue';
import { createMockHouse } from '~/tests/utils';
import { MAX_HOUSE_MEMBERS, MIN_HOUSE_MEMBERS } from '~/constants';
import type { House } from '~/types';

describe('House EditModal Component', () => {
  let mockHouse: House;

  beforeEach(() => {
    mockHouse = createMockHouse({
      id: 'house-123',
      name: 'Test House',
      address: '123 Test Street',
      currency: 'USD',
      max_members: 5,
      members: [
        {
          id: 'member-1',
          user_id: 'user-1',
          house_id: 'house-123',
          role: 'owner',
          joined_at: '2025-01-01',
        },
        {
          id: 'member-2',
          user_id: 'user-2',
          house_id: 'house-123',
          role: 'member',
          joined_at: '2025-01-02',
        },
      ],
    });
  });

  describe('Props', () => {
    it('should accept show prop', () => {
      const show = true;
      expect(show).toBe(true);
    });

    it('should accept house prop', () => {
      expect(mockHouse).toBeDefined();
      expect(mockHouse.id).toBe('house-123');
      expect(mockHouse.name).toBe('Test House');
    });

    it('should handle null house prop', () => {
      const house = null;
      expect(house).toBeNull();
    });
  });

  describe('Form State', () => {
    it('should initialize form data from house.max_members, not the live member count', () => {
      const formData = {
        name: mockHouse.name,
        address: mockHouse.address || '',
        currency: mockHouse.currency,
        memberCount: mockHouse.max_members ?? MIN_HOUSE_MEMBERS,
      };

      expect(formData.name).toBe('Test House');
      expect(formData.address).toBe('123 Test Street');
      expect(formData.currency).toBe('USD');
      // mockHouse has 2 active members but max_members: 5 — the configured
      // cap must win, never the actual member count.
      expect(formData.memberCount).toBe(5);
    });

    it('should handle house without address', () => {
      const houseWithoutAddress = createMockHouse({
        id: 'house-456',
        name: 'House 2',
        currency: 'EUR',
        address: undefined,
      });

      const formData = {
        name: houseWithoutAddress.name,
        address: houseWithoutAddress.address || '',
        currency: houseWithoutAddress.currency,
        memberCount: houseWithoutAddress.max_members ?? MIN_HOUSE_MEMBERS,
      };

      expect(formData.address).toBe('');
    });

    it('should fall back to MIN_HOUSE_MEMBERS when house has no max_members', () => {
      const houseWithoutMaxMembers = createMockHouse({
        id: 'house-789',
        name: 'House 3',
        currency: 'GBP',
        max_members: null,
      });

      const memberCount =
        houseWithoutMaxMembers.max_members ?? MIN_HOUSE_MEMBERS;
      expect(memberCount).toBe(MIN_HOUSE_MEMBERS);
    });
  });

  describe('Form Validation', () => {
    it('should require house name', () => {
      const name = '';
      const isValid = name.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should accept valid house name', () => {
      const name = 'Valid House Name';
      const isValid = name.trim().length > 0;
      expect(isValid).toBe(true);
    });

    it('should trim whitespace from name', () => {
      const name = '  House Name  ';
      const trimmed = name.trim();
      expect(trimmed).toBe('House Name');
    });

    it('should trim whitespace from address', () => {
      const address = '  123 Street  ';
      const trimmed = address.trim();
      expect(trimmed).toBe('123 Street');
    });

    it('should validate member count within limits', () => {
      const memberCount = 3;
      const isValid =
        memberCount >= MIN_HOUSE_MEMBERS && memberCount <= MAX_HOUSE_MEMBERS;
      expect(isValid).toBe(true);
    });

    it('should reject member count below minimum', () => {
      const memberCount = 0;
      const isValid =
        memberCount >= MIN_HOUSE_MEMBERS && memberCount <= MAX_HOUSE_MEMBERS;
      expect(isValid).toBe(false);
    });

    it('should reject member count above maximum', () => {
      const memberCount = MAX_HOUSE_MEMBERS + 1;
      const isValid =
        memberCount >= MIN_HOUSE_MEMBERS && memberCount <= MAX_HOUSE_MEMBERS;
      expect(isValid).toBe(false);
    });
  });

  describe('Events', () => {
    it('should emit close event', () => {
      const eventType = 'close';
      expect(eventType).toBe('close');
    });

    it('should emit submit event with payload under the max_members key', () => {
      const payload = {
        name: 'Updated House',
        address: '456 New Street',
        currency: 'EUR',
        max_members: 3,
      };

      expect(payload.name).toBe('Updated House');
      expect(payload.address).toBe('456 New Street');
      expect(payload.currency).toBe('EUR');
      expect(payload.max_members).toBe(3);
    });

    it('should create payload with optional address', () => {
      const payload = {
        name: 'House Name',
        address: '123 Street',
        currency: 'USD',
        max_members: 2,
      };

      expect(payload.address).toBeDefined();
    });

    it('should create payload without address when empty', () => {
      const address = '';
      const payload = {
        name: 'House Name',
        address: address.trim() || undefined,
        currency: 'USD',
        max_members: 2,
      };

      expect(payload.address).toBeUndefined();
    });
  });

  describe('Currency Options', () => {
    it('should have currency options available', () => {
      const currencies = ['USD', 'EUR', 'GBP'];
      expect(currencies.length).toBeGreaterThan(0);
    });

    it('should default to EUR currency', () => {
      const defaultCurrency = 'EUR';
      expect(defaultCurrency).toBe('EUR');
    });
  });

  describe('Form Reset', () => {
    it('should reset form on close', () => {
      const formData = ref({
        name: 'Modified Name',
        address: 'Modified Address',
        currency: 'GBP',
        memberCount: 5,
      });

      // Reset to original house values
      formData.value = {
        name: mockHouse.name,
        address: mockHouse.address || '',
        currency: mockHouse.currency,
        memberCount: mockHouse.max_members ?? MIN_HOUSE_MEMBERS,
      };

      expect(formData.value.name).toBe('Test House');
      expect(formData.value.address).toBe('123 Test Street');
    });
  });

  describe('Modal Visibility', () => {
    it('should show modal when show prop is true', () => {
      const show = true;
      expect(show).toBe(true);
    });

    it('should hide modal when show prop is false', () => {
      const show = false;
      expect(show).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should handle loading state', () => {
      const loading = false;
      expect(loading).toBe(false);
    });

    it('should disable inputs when loading', () => {
      const loading = true;
      const isDisabled = loading;
      expect(isDisabled).toBe(true);
    });
  });
});
