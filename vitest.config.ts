import { defineVitestConfig } from '@nuxt/test-utils/config';
import { resolve } from 'path';

export default defineVitestConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, './app'),
      '~~': resolve(__dirname, '.'),
      '@': resolve(__dirname, './app'),
    },
  },
  test: {
    environment: 'nuxt',
    globals: true,
    globalSetup: ['./vitest.globalSetup.ts'],
    setupFiles: ['./app/tests/setup.ts'],
    env: {
      JWT_SECRET: 'test-jwt-secret-must-be-at-least-32chars!!',
    },
    include: [
      'app/**/*.test.{js,ts}',
      'app/**/__tests__/**/*.{js,ts}',
      'server/**/*.test.{js,ts}',
      'server/**/__tests__/**/*.{js,ts}',
      // shared/ holds the money/balance/settlement engine used by both app and
      // server; without this entry its suite is silently never collected.
      'shared/**/*.test.{js,ts}',
      'shared/**/__tests__/**/*.{js,ts}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      exclude: [
        '**/__tests__/**',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '**/tests/**',
        '**/*.d.ts',
        '**/types/**',
        'node_modules/**',
        '.nuxt/**',
        'dist/**',
      ],
      clean: true,
      thresholds: {
        lines: 90,
        functions: 75,
        branches: 82,
        statements: 90,
      },
      reportsDirectory: './coverage',
    },
  },
});
