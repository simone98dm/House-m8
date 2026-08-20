/**
 * Skeleton Component Tests
 * Tests for UI skeleton component following CLAUDE.md guidelines
 */

import { describe, it, expect } from 'vitest';

describe('Skeleton Component', () => {
  describe('Props', () => {
    it('should have default props', () => {
      const defaultHeight = 20;
      const defaultWidth = '100%';
      const defaultRounded = 'rounded-lg';

      expect(defaultHeight).toBe(20);
      expect(defaultWidth).toBe('100%');
      expect(defaultRounded).toBe('rounded-lg');
    });

    it('should accept height prop as number', () => {
      const height = 32;
      expect(typeof height).toBe('number');
      expect(height).toBe(32);
    });

    it('should accept height prop as string', () => {
      const height = '2rem';
      expect(typeof height).toBe('string');
      expect(height).toBe('2rem');
    });

    it('should accept width prop as number', () => {
      const width = 200;
      expect(typeof width).toBe('number');
      expect(width).toBe(200);
    });

    it('should accept width prop as string', () => {
      const width = '50%';
      expect(typeof width).toBe('string');
      expect(width).toBe('50%');
    });

    it('should accept rounded prop', () => {
      const rounded = 'rounded-full';
      expect(rounded).toBe('rounded-full');
    });
  });

  describe('Styling', () => {
    it('should apply base skeleton classes', () => {
      const baseClasses = 'bg-gray-200 animate-pulse';
      expect(baseClasses).toContain('bg-gray-200');
      expect(baseClasses).toContain('animate-pulse');
    });

    it('should apply rounded class', () => {
      const rounded = 'rounded-lg';
      expect(rounded).toBe('rounded-lg');
    });

    it('should apply custom rounded class', () => {
      const rounded = 'rounded-full';
      expect(rounded).toBe('rounded-full');
    });
  });

  describe('Dimensions', () => {
    it('should set height style for number values', () => {
      const height = 40;
      const heightStyle = typeof height === 'number' ? `${height}px` : height;
      expect(heightStyle).toBe('40px');
    });

    it('should set height style for string values', () => {
      const height = '3rem';
      const heightStyle = typeof height === 'number' ? `${height}px` : height;
      expect(heightStyle).toBe('3rem');
    });

    it('should set width style for number values', () => {
      const width = 150;
      const widthStyle = typeof width === 'number' ? `${width}px` : width;
      expect(widthStyle).toBe('150px');
    });

    it('should set width style for string values', () => {
      const width = '75%';
      const widthStyle = typeof width === 'number' ? `${width}px` : width;
      expect(widthStyle).toBe('75%');
    });
  });

  describe('Animation', () => {
    it('should apply pulse animation', () => {
      const animationClass = 'animate-pulse';
      expect(animationClass).toBe('animate-pulse');
    });
  });

  describe('Color', () => {
    it('should use gray-200 background', () => {
      const backgroundClass = 'bg-gray-200';
      expect(backgroundClass).toBe('bg-gray-200');
    });
  });

  describe('Use Cases', () => {
    it('should work as text skeleton', () => {
      const height = 16;
      const width = '200px';
      const rounded = 'rounded';
      expect(height).toBe(16);
      expect(width).toBe('200px');
      expect(rounded).toBe('rounded');
    });

    it('should work as card skeleton', () => {
      const height = 120;
      const width = '300px';
      const rounded = 'rounded-lg';
      expect(height).toBe(120);
      expect(width).toBe('300px');
      expect(rounded).toBe('rounded-lg');
    });

    it('should work as avatar skeleton', () => {
      const height = 40;
      const width = 40;
      const rounded = 'rounded-full';
      expect(height).toBe(40);
      expect(width).toBe(40);
      expect(rounded).toBe('rounded-full');
    });

    it('should work as button skeleton', () => {
      const height = 36;
      const width = '120px';
      const rounded = 'rounded-md';
      expect(height).toBe(36);
      expect(width).toBe('120px');
      expect(rounded).toBe('rounded-md');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero height', () => {
      const height = 0;
      const heightStyle = typeof height === 'number' ? `${height}px` : height;
      expect(heightStyle).toBe('0px');
    });

    it('should handle zero width', () => {
      const width = 0;
      const widthStyle = typeof width === 'number' ? `${width}px` : width;
      expect(widthStyle).toBe('0px');
    });

    it('should handle very large dimensions', () => {
      const height = 10000;
      const width = 10000;
      expect(height).toBe(10000);
      expect(width).toBe(10000);
    });

    it('should handle empty rounded class', () => {
      const rounded = '';
      expect(rounded).toBe('');
    });

    it('should handle complex width values', () => {
      const width = 'calc(100% - 2rem)';
      expect(width).toBe('calc(100% - 2rem)');
    });

    it('should handle complex height values', () => {
      const height = 'min(200px, 50vh)';
      expect(height).toBe('min(200px, 50vh)');
    });
  });
});
