import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * E2E runs against its own database (`clinic_db_e2e`) on its own port, so
 * creating and cancelling appointments in a test never touches the data you
 * are looking at in `npm run dev`.
 *
 * It drives a production build rather than `next dev`: Next refuses a second
 * dev server in the same directory, and a real build is what we want to assert
 * against anyway. Reset the database first: `npm run db:e2e:reset`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `dotenv -e .env.e2e -e .env -- sh -c 'next build && next start --port ${PORT}'`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
