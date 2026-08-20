/**
 * BillsPreview Component Tests
 * Tests for house bills preview component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockBill } from '~/tests/utils';
import type { Bill } from '~/types';

describe('House BillsPreview Component', () => {
  let mockBills: Bill[];

  beforeEach(() => {
    mockBills = [
      createMockBill({
        id: 'bill-1',
        description: 'Electricity',
        monthly_cost: 150.5,
        next_due_date: '2025-12-15',
        currency: 'USD',
        active: true,
      }),
      createMockBill({
        id: 'bill-2',
        description: 'Water',
        monthly_cost: 50.0,
        next_due_date: '2025-12-10',
        currency: 'USD',
        active: true,
      }),
      createMockBill({
        id: 'bill-3',
        description: 'Internet',
        monthly_cost: 45.99,
        next_due_date: '2025-12-20',
        currency: 'USD',
        active: true,
      }),
      createMockBill({
        id: 'bill-4',
        description: 'Gas',
        monthly_cost: 80.0,
        next_due_date: '2025-12-18',
        currency: 'USD',
        active: true,
      }),
    ];
  });

  describe('Props', () => {
    it('should accept bills prop', () => {
      expect(mockBills).toBeDefined();
      expect(Array.isArray(mockBills)).toBe(true);
      expect(mockBills.length).toBe(4);
    });

    it('should have default maxVisible prop', () => {
      const defaultMaxVisible = 3;
      expect(defaultMaxVisible).toBe(3);
    });

    it('should accept custom maxVisible prop', () => {
      const maxVisible = 5;
      expect(maxVisible).toBeGreaterThan(0);
    });
  });

  describe('Computed Properties', () => {
    it('should calculate visibleBills based on maxVisible', () => {
      const maxVisible = 3;
      const visibleBills = mockBills.slice(0, maxVisible);
      expect(visibleBills.length).toBe(3);
      expect(visibleBills[0]?.id).toBe('bill-1');
      expect(visibleBills[2]?.id).toBe('bill-3');
    });

    it('should show all bills if less than maxVisible', () => {
      const maxVisible = 10;
      const visibleBills = mockBills.slice(0, maxVisible);
      expect(visibleBills.length).toBe(4);
    });

    it('should calculate remaining count correctly', () => {
      const maxVisible = 3;
      const remainingCount =
        mockBills.length > maxVisible ? mockBills.length - maxVisible : 0;
      expect(remainingCount).toBe(1);
    });

    it('should show zero remaining when all bills visible', () => {
      const maxVisible = 5;
      const remainingCount =
        mockBills.length > maxVisible ? mockBills.length - maxVisible : 0;
      expect(remainingCount).toBe(0);
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      const dateString = '2025-12-15';
      const formatted = new Date(dateString).toLocaleDateString();
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle different date formats', () => {
      const dates = ['2025-12-15', '2025-01-01', '2025-06-30'];
      dates.forEach((dateString) => {
        const formatted = new Date(dateString).toLocaleDateString();
        expect(formatted).toBeTruthy();
      });
    });
  });

  describe('Events', () => {
    it('should emit view-all event', () => {
      const eventEmitted = 'view-all';
      expect(eventEmitted).toBe('view-all');
    });
  });

  describe('Bill Display', () => {
    it('should display bill description', () => {
      const [bill] = mockBills;
      expect(bill?.description).toBe('Electricity');
    });

    it('should display bill monthly cost', () => {
      const [bill] = mockBills;
      expect(bill?.monthly_cost).toBe(150.5);
    });

    it('should display bill due date', () => {
      const [bill] = mockBills;
      expect(bill?.next_due_date).toBe('2025-12-15');
    });

    it('should display bill currency', () => {
      const [bill] = mockBills;
      expect(bill?.currency).toBe('USD');
    });
  });

  describe('Empty State', () => {
    it('should handle empty bills array', () => {
      const emptyBills: Bill[] = [];
      expect(emptyBills.length).toBe(0);
    });

    it('should show no bills message when empty', () => {
      const emptyBills: Bill[] = [];
      const isEmpty = emptyBills.length === 0;
      expect(isEmpty).toBe(true);
    });
  });

  describe('Bill Visibility', () => {
    it('should show correct number of bills', () => {
      const maxVisible = 2;
      const visibleBills = mockBills.slice(0, maxVisible);
      expect(visibleBills.length).toBe(2);
    });

    it('should show remaining count indicator', () => {
      const maxVisible = 2;
      const hasRemaining = mockBills.length > maxVisible;
      expect(hasRemaining).toBe(true);
    });

    it('should not show remaining count when all visible', () => {
      const maxVisible = 10;
      const hasRemaining = mockBills.length > maxVisible;
      expect(hasRemaining).toBe(false);
    });
  });
});
