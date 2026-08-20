import withNuxt from './.nuxt/eslint.config.mjs';
import eslintConfigPrettier from 'eslint-config-prettier';

export default withNuxt(
  {
    ignores: [
      // Generated / build output
      '.nuxt/**',
      '.output/**',
      'dist/**',
      'node_modules/**',

      // Test coverage / reports
      'coverage/**',
      'lighthouse-report.html',
      'graphify-out/**',

      // Config files that don't need linting
      'commitlint.config.*',
      'postcss.config.*',
      '*.d.ts',
    ],
  },
  eslintConfigPrettier,
  {
    rules: {
      'no-console': 'warn',
      'vue/no-multiple-root': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/html-self-closing': 'off',
    },
  },
);
