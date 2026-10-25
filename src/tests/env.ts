/**
 * Points the Prisma client at the test database before anything imports it.
 * Loaded first by `serverSetup` via the import order in vitest.config.ts.
 */
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
