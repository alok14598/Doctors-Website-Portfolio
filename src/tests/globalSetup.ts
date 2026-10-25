import { execSync } from 'node:child_process';

/**
 * Brings `clinic_db_test` up to the current migration state once per run.
 * `migrate deploy` is idempotent, so this is cheap on repeat runs.
 */
export default function setup(): void {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Copy .env.example to .env and start Postgres with `docker compose up -d`.',
    );
  }

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
