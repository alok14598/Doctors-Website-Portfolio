import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 reads the datasource URL from here rather than from schema.prisma.
 * The value still comes from the environment and is never written in the repo;
 * `dotenv-cli` loads .env for the npm db:* scripts.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Read from the environment directly rather than through Prisma's `env()`
    // helper. `env()` throws when the variable is absent, which would make a
    // bare `npm install` fail — `postinstall` runs `prisma generate`, and
    // generating the client needs no database at all. The commands that do
    // need a URL (`migrate`, `studio`) always run through `dotenv-cli`.
    url: process.env.DATABASE_URL ?? '',
  },
});
