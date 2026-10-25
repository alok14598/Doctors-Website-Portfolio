import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Two projects, because the two kinds of test need different worlds:
 *
 *  - `server` runs in Node against the real `clinic_db_test` Postgres. Service
 *    tests that mocked Prisma would only prove the mock works.
 *  - `web` runs in jsdom for components and pure functions.
 *
 * Plugins and `resolve` are declared once here; inline projects inherit them.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/server/**/*.test.ts', 'src/lib/**/*.test.ts'],
          globalSetup: ['src/tests/globalSetup.ts'],
          setupFiles: ['src/tests/env.ts', 'src/tests/serverSetup.ts'],
          // Integration tests share one database, so they must not interleave.
          fileParallelism: false,
        },
      },
      {
        test: {
          name: 'web',
          environment: 'jsdom',
          include: ['src/components/**/*.test.tsx', 'src/app/**/*.test.tsx'],
          setupFiles: ['src/tests/webSetup.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Scoped to the layers unit tests can meaningfully cover. Server
      // Components, route files and Server Actions are exercised end to end by
      // Playwright instead — counting them here would only invite tests that
      // render a page and assert nothing.
      include: [
        'src/lib/**/*.ts',
        'src/server/services/**/*.ts',
        'src/server/repositories/**/*.ts',
        'src/components/ui/**/*.tsx',
        'src/components/sections/**/*.tsx',
        'src/components/layout/**/*.tsx',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        // Auth.js wiring and env validation run at module load; covered by the
        // Playwright sign-in specs.
        'src/lib/auth.ts',
        'src/lib/env.ts',
        // Interactive forms and client nav: covered by Playwright.
        'src/components/sections/AppointmentForm.tsx',
        'src/components/layout/Header.tsx',
        'src/components/layout/AdminShell.tsx',
      ],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
});
