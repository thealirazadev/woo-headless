import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/components/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      reporter: ['text-summary'],
      thresholds: { lines: 90, statements: 90, functions: 85, branches: 80 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
