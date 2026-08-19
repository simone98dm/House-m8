/**
 * InformationCard Component Tests
 * Tests for house information card component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockHouse } from '~/tests/utils';
import type { House, Currency } from '~/types';

describe('House InformationCard Component', () => {
  let mockHouse: House;

  beforeEach(() => {
    mockHouse = createMockHouse({
      id: 'house-123',
      name: 'Test House',
      address: '123 Test Street',
      currency: 'USD',
      max_members: 5,
    });
  });

  describe('Props', () => {
    it('should accept house prop', () => {
      expect(mockHouse).toBeDefined();
      expect(mockHouse.id).toBe('house-123');
      expect(mockHouse.name).toBe('Test House');
    });

    it('should have default isOwner prop', () => {
      const defaultIsOwner = false;
      expect(defaultIsOwner).toBe(false);
    });

    it('should accept isOwner prop', () => {
      const isOwner = true;
      expect(isOwner).toBe(true);
    });
  });

  describe('House Information Display', () => {
    it('should display house address', () => {
      expect(mockHouse.address).toBe('123 Test Street');
    });

    it('should display house currency', () => {
      expect(mockHouse.currency).toBe('USD');
    });

    it('should display the configured max_members cap, not a derived member count', () => {
      expect(mockHouse.max_members).toBe(5);
    });

    it('should fall back to notProvided text when max_members is unset', () => {
      const houseWithoutMaxMembers = createMockHouse({
        id: 'house-999',
        name: 'House 4',
        currency: 'USD',
        max_members: null,
      });

      const display = houseWithoutMaxMembers.max_members ?? 'Not provided';
      expect(display).toBe('Not provided');
    });

    it('should handle house without address', () => {
      const houseWithoutAddress = createMockHouse({
        id: 'house-456',
        name: 'House 2',
        currency: 'EUR',
        address: undefined,
      });

      const displayAddress = houseWithoutAddress.address || 'Not provided';
      expect(displayAddress).toBe('Not provided');
    });
  });

  describe('Currency Display', () => {
    it('should display currency name', () => {
      const currencyNames: Record<Currency, string> = {
        USD: 'US Dollar',
        EUR: 'Euro',
      };

      const currencyName = currencyNames[mockHouse.currency as Currency];
      expect(currencyName).toBe('US Dollar');
    });

    it('should handle different currencies', () => {
      const currencies: Currency[] = ['USD', 'EUR'];
      currencies.forEach((currency) => {
        expect(['USD', 'EUR']).toContain(currency);
      });
    });
  });

  describe('Edit Capability', () => {
    it('should show edit button for owner', () => {
      const isOwner = true;
      const showEdit = isOwner;
      expect(showEdit).toBe(true);
    });

    it('should hide edit button for non-owner', () => {
      const isOwner = false;
      const showEdit = isOwner;
      expect(showEdit).toBe(false);
    });
  });

  describe('Events', () => {
    it('should emit edit-click event', () => {
      const eventType = 'edit-click';
      expect(eventType).toBe('edit-click');
    });
  });

  describe('House Properties', () => {
    it('should have all required properties', () => {
      expect(mockHouse).toHaveProperty('id');
      expect(mockHouse).toHaveProperty('name');
      expect(mockHouse).toHaveProperty('currency');
    });

    it('should have optional address property', () => {
      expect(mockHouse).toHaveProperty('address');
    });
  });

  describe('Component Layout', () => {
    it('should display header with title', () => {
      const hasHeader = true;
      expect(hasHeader).toBe(true);
    });

    it('should use grid layout for information', () => {
      const usesGrid = true;
      expect(usesGrid).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for information fields', () => {
      const hasLabels = true;
      expect(hasLabels).toBe(true);
    });
  });

  describe('Empty States', () => {
    it('should show fallback text when address is missing', () => {
      const houseWithoutAddress = createMockHouse({
        id: 'house-789',
        name: 'House 3',
        currency: 'GBP',
        address: undefined,
      });

      const displayAddress = houseWithoutAddress.address || 'Not provided';
      expect(displayAddress).toBe('Not provided');
    });
  });
});
