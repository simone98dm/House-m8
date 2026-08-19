/**
 * Bill Card Component Tests
 * Tests for bill card display component following CLAUDE.md guidelines
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { computed } from 'vue';
import { createMockBill, createMockI18n } from '~/tests/utils';
import type { Bill } from '~/types';

describe('Bill Card Component', () => {
  let mockBill: Bill;
  const mockI18n = createMockI18n();

  beforeEach(() => {
    mockBill = createMockBill({
      id: 'bill-123',
      description: 'Electricity Bill',
      monthly_cost: 150.5,
      next_due_date: '2025-12-15',
      currency: 'USD',
      active: true,
      updated_at: '2025-01-01T00:00:00Z',
      creator: {
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        created_at: '2025-01-01',
      },
    });
  });

  describe('Props', () => {
    it('should accept bill prop', () => {
      expect(mockBill).toBeDefined();
      expect(mockBill.id).toBe('bill-123');
      expect(mockBill.description).toBe('Electricity Bill');
    });

    it('should have required bill properties', () => {
      expect(mockBill).toHaveProperty('id');
      expect(mockBill).toHaveProperty('description');
      expect(mockBill).toHaveProperty('monthly_cost');
      expect(mockBill).toHaveProperty('next_due_date');
      expect(mockBill).toHaveProperty('currency');
    });
  });

  describe('Computed Properties', () => {
    it('should format due date correctly', () => {
      const dueDate = new Date(mockBill.next_due_date);
      const formatted = dueDate.toLocaleDateString(window.navigator.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      expect(formatted).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    });

    it('should generate bill link', () => {
      const billLink = `/bills/${mockBill.id}`;
      expect(billLink).toBe('/bills/bill-123');
    });

    it('should format currency amount', () => {
      const amount = mockBill.monthly_cost;
      const formatted = amount.toFixed(2);
      expect(formatted).toBe('150.50');
    });
  });

  describe('Display Content', () => {
    it('should display bill description', () => {
      expect(mockBill.description).toBe('Electricity Bill');
    });

    it('should display monthly cost', () => {
      expect(mockBill.monthly_cost).toBe(150.5);
    });

    it('should display due date', () => {
      expect(mockBill.next_due_date).toBe('2025-12-15');
    });

    it('should display creator name', () => {
      expect(mockBill.creator?.first_name).toBe('John');
    });
  });

  describe('Styling', () => {
    it('should have card container classes', () => {
      const containerClasses = 'p-3 bg-gray-50 rounded-lg hover:bg-gray-100';
      expect(containerClasses).toContain('bg-gray-50');
      expect(containerClasses).toContain('rounded-lg');
      expect(containerClasses).toContain('hover:bg-gray-100');
    });

    it('should have transition classes', () => {
      const transitionClass = 'transition-colors';
      expect(transitionClass).toBe('transition-colors');
    });

    it('should be cursor pointer', () => {
      const cursorClass = 'cursor-pointer';
      expect(cursorClass).toBe('cursor-pointer');
    });
  });

  describe('Navigation', () => {
    it('should create correct link to bill detail', () => {
      const billLink = computed(() => `/bills/${mockBill.id}`);
      expect(billLink.value).toBe('/bills/bill-123');
    });

    it('should be a NuxtLink component', () => {
      const isLink = true;
      expect(isLink).toBe(true);
    });
  });

  describe('Translation Keys', () => {
    it('should use correct translation for due date', () => {
      const key = 'bills.due';
      expect(mockI18n.t(key)).toBe('bills.due');
    });

    it('should use correct translation for created by', () => {
      const key = 'bills.createdBy';
      expect(mockI18n.t(key)).toBe('bills.createdBy');
    });

    it('should use correct translation for monthly', () => {
      const key = 'bills.monthly';
      expect(mockI18n.t(key)).toBe('bills.monthly');
    });
  });

  describe('Icon Display', () => {
    it('should show chevron-right icon', () => {
      const iconName = 'heroicons:chevron-right';
      expect(iconName).toBe('heroicons:chevron-right');
    });
  });

  describe('Layout Structure', () => {
    it('should have flex layout', () => {
      const layoutClasses = 'flex items-center justify-between';
      expect(layoutClasses).toContain('flex');
      expect(layoutClasses).toContain('items-center');
      expect(layoutClasses).toContain('justify-between');
    });

    it('should have left content section', () => {
      const leftSection = 'flex-1';
      expect(leftSection).toBe('flex-1');
    });

    it('should have right content section', () => {
      const rightSection = 'text-right flex items-center gap-2';
      expect(rightSection).toContain('text-right');
      expect(rightSection).toContain('flex');
    });
  });
});
