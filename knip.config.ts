import type { KnipConfig } from 'knip';

export default {
  ignoreBinaries: ['publish'],
  ignoreDependencies: [
    // Dev tools
    '@averay/codeformat',
    'bumpp',
    'husky',
  ],
  entry: ['tests/**/*.test.ts', 'tests/preload.ts'],
  project: ['lib/**/*.ts!', 'tests/**/*.ts'],
} satisfies KnipConfig;
