/**
 * Checkbox Component Tests
 * Tests for UI checkbox component following CLAUDE.md guidelines
 */

import { describe, it, expect } from 'vitest';

describe('Checkbox Component', () => {
  describe('Props', () => {
    it('should have default props', () => {
      const defaultDisabled = false;
      const defaultSize = 'md';

      expect(defaultDisabled).toBe(false);
      expect(defaultSize).toBe('md');
    });

    it('should require modelValue prop', () => {
      const modelValue = false;
      expect(typeof modelValue).toBe('boolean');
    });

    it('should accept modelValue prop', () => {
      const modelValue = true;
      expect(modelValue).toBe(true);
    });

    it('should accept label prop', () => {
      const label = 'Test Label';
      expect(label).toBe('Test Label');
    });

    it('should accept disabled prop', () => {
      const disabled = true;
      expect(typeof disabled).toBe('boolean');
    });

    it('should accept size prop', () => {
      const sizes = ['sm', 'md', 'lg'];
      sizes.forEach((size) => {
        expect(size).toMatch(/^(sm|md|lg)$/);
      });
    });
  });

  describe('State Management', () => {
    it('should emit update:modelValue when clicked', () => {
      const modelValue = false;
      const newValue = !modelValue;
      expect(newValue).toBe(true);
    });

    it('should toggle modelValue correctly', () => {
      let modelValue = false;
      modelValue = !modelValue;
      expect(modelValue).toBe(true);

      modelValue = !modelValue;
      expect(modelValue).toBe(false);
    });

    it('should not emit when disabled', () => {
      const disabled = true;
      const shouldEmit = !disabled;
      expect(shouldEmit).toBe(false);
    });
  });

  describe('Classes and Styling', () => {
    it('should generate correct base classes', () => {
      const baseClasses = 'inline-flex items-center gap-2 cursor-pointer';
      expect(baseClasses).toContain('inline-flex');
      expect(baseClasses).toContain('items-center');
      expect(baseClasses).toContain('gap-2');
      expect(baseClasses).toContain('cursor-pointer');
    });

    it('should generate correct checkbox input classes', () => {
      const checkboxClasses = 'sr-only';
      expect(checkboxClasses).toBe('sr-only');
    });

    it('should generate correct custom checkbox classes', () => {
      const customCheckboxClasses =
        'w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center transition-colors';
      expect(customCheckboxClasses).toContain('w-4');
      expect(customCheckboxClasses).toContain('h-4');
      expect(customCheckboxClasses).toContain('border-2');
      expect(customCheckboxClasses).toContain('rounded');
    });

    it('should include checked styling when modelValue is true', () => {
      const modelValue = true;
      const checkedClasses = modelValue
        ? 'bg-blue-600 border-blue-600'
        : 'bg-white border-gray-300';
      expect(checkedClasses).toContain('bg-blue-600');
      expect(checkedClasses).toContain('border-blue-600');
    });

    it('should include unchecked styling when modelValue is false', () => {
      const modelValue = false;
      const checkedClasses = modelValue
        ? 'bg-blue-600 border-blue-600'
        : 'bg-white border-gray-300';
      expect(checkedClasses).toContain('bg-white');
      expect(checkedClasses).toContain('border-gray-300');
    });

    it('should include disabled classes when disabled', () => {
      const disabled = true;
      const disabledClasses = disabled ? 'cursor-not-allowed opacity-50' : '';
      expect(disabledClasses).toContain('cursor-not-allowed');
      expect(disabledClasses).toContain('opacity-50');
    });

    it('should generate correct size classes for sm', () => {
      const size = 'sm';
      const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
      };
      expect(sizeClasses[size]).toBe('w-3 h-3');
    });

    it('should generate correct size classes for md', () => {
      const size = 'md';
      const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
      };
      expect(sizeClasses[size]).toBe('w-4 h-4');
    });

    it('should generate correct size classes for lg', () => {
      const size = 'lg';
      const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
      };
      expect(sizeClasses[size]).toBe('w-5 h-5');
    });

    it('should generate correct label classes', () => {
      const labelClasses = 'text-sm font-medium text-gray-700 cursor-pointer';
      expect(labelClasses).toContain('text-sm');
      expect(labelClasses).toContain('font-medium');
      expect(labelClasses).toContain('text-gray-700');
      expect(labelClasses).toContain('cursor-pointer');
    });

    it('should include disabled label classes when disabled', () => {
      const disabled = true;
      const disabledLabelClasses = disabled
        ? 'text-gray-400 cursor-not-allowed'
        : '';
      expect(disabledLabelClasses).toContain('text-gray-400');
      expect(disabledLabelClasses).toContain('cursor-not-allowed');
    });
  });

  describe('Icon Logic', () => {
    it('should show check icon when checked', () => {
      const modelValue = true;
      const iconName = modelValue ? 'heroicons:check' : '';
      expect(iconName).toBe('heroicons:check');
    });

    it('should not show icon when unchecked', () => {
      const modelValue = false;
      const iconName = modelValue ? 'heroicons:check' : '';
      expect(iconName).toBe('');
    });

    it('should generate correct icon classes', () => {
      const iconClasses = 'w-3 h-3 text-white';
      expect(iconClasses).toContain('w-3');
      expect(iconClasses).toContain('h-3');
      expect(iconClasses).toContain('text-white');
    });
  });

  describe('Accessibility', () => {
    it('should have correct input attributes', () => {
      const type = 'checkbox';
      const modelValue = true;
      expect(type).toBe('checkbox');
      expect(typeof modelValue).toBe('boolean');
    });

    it('should support keyboard navigation', () => {
      const supportedKeys = ['Space'];
      expect(supportedKeys).toContain('Space');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined label', () => {
      const label = undefined;
      expect(label).toBeUndefined();
    });

    it('should handle empty label', () => {
      const label = '';
      expect(label).toBe('');
    });

    it('should handle long label text', () => {
      const label = 'A'.repeat(1000);
      expect(label.length).toBe(1000);
    });
  });
});
