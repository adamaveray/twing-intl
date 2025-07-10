import { globals, makeEslintConfig } from '@averay/codeformat';

export default [
  ...makeEslintConfig({ tsconfigPath: './tsconfig.json' }),
  {
    files: ['lib/**/*.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2025 },
    },
  },
  {
    files: ['lib/tagHandlers/**/executor*.ts'],
    rules: {
      'no-await-in-loop': 'off', // Twing requires each execution step to be sequential.
    },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2025, process: true },
    },
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'unicorn/consistent-function-scoping': 'off',
    },
  },
];
