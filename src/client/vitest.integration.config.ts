import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/tests/integration/**/*.integration.test.ts', 'src/tests/integration/**/*.integration.test.tsx'],
  },
});
