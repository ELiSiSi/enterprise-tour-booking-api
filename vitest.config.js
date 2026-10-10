import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    pool: 'forks',
    hookTimeout: 60000,
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
