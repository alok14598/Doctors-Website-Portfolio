/**
 * Resets the database this process points at: schema up to date, every table
 * emptied, then reseeded.
 *
 * Why not `prisma migrate reset`: that drops the database, which Prisma gates
 * behind an interactive confirmation — fine once, hostile as a script someone
 * runs before every test session. Truncating gives the same guarantee for a
 * seeded fixture database without the destructive-command ceremony.
 *
 * Why this exists at all: `migrate deploy` + seed is *not* a reset. The seed
 * upserts on natural keys, so a row a test renamed survives as an orphan and
 * the next run starts dirty — which is exactly how two E2E tests began failing
 * against a database that had supposedly just been reset.
 */
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

// A seeded fixture database is the only safe target for this.
if (!/_test|_e2e/.test(connectionString)) {
  throw new Error(
    'Refusing to reset: DATABASE_URL does not name a _test or _e2e database.\n' +
      'Point it at clinic_db_test or clinic_db_e2e first.',
  );
}

const run = (command: string) => execSync(command, { stdio: 'inherit' });

const main = async (): Promise<void> => {
  run('npx prisma migrate deploy');

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    // Read the table list from the database rather than hard-coding it, so a
    // new model cannot be silently left behind.
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
    `;

    if (tables.length > 0) {
      const list = tables.map((row) => `"${row.tablename}"`).join(', ');
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
      console.log(`  ✓ truncated ${tables.length} tables`);
    }
  } finally {
    await prisma.$disconnect();
  }

  run('npx tsx prisma/seed.ts');
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
