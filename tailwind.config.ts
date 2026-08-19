import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./app/**/*.{js,vue,ts}', './app.vue', './error.vue'],
  theme: {
    extend: {
      /* Typography - Improved hierarchy */
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        sm: ['0.875rem', { lineHeight: '1.55', letterSpacing: '0.01em' }],
        base: ['1rem', { lineHeight: '1.65', letterSpacing: '0em' }],
        lg: ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
        xl: ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '1.35', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        // Display — editorial hero moments (clamp for fluid responsive scaling)
        'display-sm': [
          'clamp(1.75rem, 4vw, 2.75rem)',
          { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '800' },
        ],
        'display-md': [
          'clamp(2.25rem, 5.5vw, 3.75rem)',
          { lineHeight: '1.02', letterSpacing: '-0.035em', fontWeight: '800' },
        ],
        'display-lg': [
          'clamp(3rem, 8vw, 5.5rem)',
          { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '800' },
        ],
      },

      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        // Plus Jakarta Sans ships no 900 face — main.css declares 200-800 only.
        // Measured in Chromium: a 900 request renders the 800 face at an
        // identical width (373.3828125px vs 373.3828125px at 64px), i.e. no
        // faux-bold synthesis. Mapping `black` to the heaviest real weight
        // makes that resolution explicit and identical in engines that would
        // otherwise synthesize. `font-black` is therefore `font-extrabold` by
        // design; do not raise it to 900 without shipping a 900 font file.
        black: '800',
      },

      /* Color Palette — Kinetic Gallery (DESIGN.md)
       *   Primary   #0066CC  (Electric Blue)
       *   Surface   #fcf8fb → #e4e2e4  (Atmospheric tiers)
       *   On-surface #1b1b1d / #414753
       *   Error     #ba1a1a
       *   Tertiary  #3e39c6  (vibrant indigo, chips)
       */
      colors: {
        // Primary — Blue (aligned with new design system --blue-500 = #3b82f6)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // Surface tiers — bright cool-white aligned with Electric Blue primary
        surface: {
          DEFAULT: '#f5f8ff',
          lowest: '#ffffff',
          low: '#eef2fe',
          container: '#e7edfb',
          high: '#dde5f7',
          highest: '#d0dbf0',
        },

        // Neutral Gray — Deep Space inspired (#1d1d1f = 900)
        gray: {
          50: '#f5f5f7',
          100: '#e8e8ea',
          200: '#d1d1d3',
          300: '#b0b0b3',
          400: '#8e8e92',
          500: '#6e6e73',
          600: '#4e4e53',
          700: '#3a3a3f',
          800: '#2c2c2e',
          900: '#1d1d1f',
          950: '#0f0f11',
        },

        // Purple — secondary color (new design system)
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },

        // Secondary — muted slate-blue (kept for non-primary accents)
        secondary: {
          50: '#f0f3f8',
          100: '#dee4ef',
          200: '#bccce3',
          300: '#93add2',
          400: '#7a94bc',
          500: '#5f78a3',
          600: '#4e638a',
          700: '#3f5070',
          800: '#354459',
          900: '#2e3b4c',
          950: '#1d2530',
        },

        // Tertiary — Vibrant Indigo for chips/selection (#3e39c6 = 600)
        tertiary: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c3ff',
          300: '#a09eff',
          400: '#7b78f0',
          500: '#5b54d6',
          600: '#3e39c6',
          700: '#2f2a9e',
          800: '#231e7b',
          900: '#17135c',
          950: '#0d0b3d',
        },

        // Accent — Sky Blue
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },

        // Semantic Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },

        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          900: '#78350f',
        },

        // Error — #ba1a1a = 600 (DESIGN.md spec)
        error: {
          50: '#fff0f0',
          100: '#ffdada',
          200: '#ffb3b3',
          // 400 filled in (matches --red-400 in main.css) — success/warning/primary
          // all define a 400 step for dark-surface text, error didn't, so every
          // `dark:text-error-400` / `dark:border-error-400` in the codebase was
          // silently generating no rule (undefined Tailwind class) and falling
          // back to light-mode error-600, which fails WCAG AA (~3.5:1) on dark
          // surfaces. #f87171 reuses the app's existing red-400 value.
          400: '#f87171',
          500: '#d32f2f',
          600: '#ba1a1a',
          700: '#9b1616',
          900: '#7a1212',
        },

        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },

      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', 'sans-serif'],
      },

      /* Animations */
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        'bounce-in-scale':
          'bounceInScale 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'expand-width': 'expandWidth 600ms ease-out forwards',
        'slide-out-right': 'slideOutRight 250ms ease-in forwards',
        'pulse-select': 'pulseSelect 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        slideDown: {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        bounceInScale: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '60%': { opacity: '1', transform: 'scale(1.08)' },
          '80%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
        expandWidth: {
          from: { width: '0%' },
          to: { width: 'var(--target-width, 0%)' },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)', opacity: '1', maxHeight: '80px' },
          to: {
            transform: 'translateX(110%)',
            opacity: '0',
            maxHeight: '0',
            padding: '0',
            margin: '0',
          },
        },
        pulseSelect: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
      },

      /* Enhanced Spacing */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      /* Ambient Shadows — Kinetic Gallery (large blur, low opacity, tinted) */
      boxShadow: {
        xs: '0 1px 4px 0 rgba(27, 27, 29, 0.04)',
        sm: '0 2px 8px 0 rgba(27, 27, 29, 0.05)',
        md: '0 4px 20px 0 rgba(27, 27, 29, 0.06)',
        lg: '0 8px 40px 0 rgba(27, 27, 29, 0.07)',
        xl: '0 16px 60px 0 rgba(27, 27, 29, 0.08)',
        '2xl': '0 24px 80px 0 rgba(27, 27, 29, 0.10)',
        inner: 'inset 0 2px 6px 0 rgba(27, 27, 29, 0.04)',
        glow: '0 0 30px rgba(0, 102, 204, 0.12)',
        'glow-lg': '0 0 60px rgba(0, 102, 204, 0.10)',
        none: 'none',
      },

      /* Border Radius */
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      /* Enhanced Transitions */
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
      },

      transitionDuration: {
        '0': '0ms',
        '400': '400ms',
        '600': '600ms',
      },

      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [forms, typography, containerQueries],
};
