import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // `cacheComponents` is deliberately off. Clinic content is read per-request
  // from Postgres and invalidated explicitly with `revalidatePath` after an
  // admin edit, which is simpler to reason about than the implicit cache.
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // `typedRoutes` is off: the shared ButtonLink and Avatar take hrefs that are
  // built at runtime (slugs, an external maps URL), which the generated Route
  // union rejects without a cast at every call site. Link targets are covered
  // by the Playwright route walk instead.
  typedRoutes: false,
};

export default nextConfig;
