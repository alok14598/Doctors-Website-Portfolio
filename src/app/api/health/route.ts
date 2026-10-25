import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

/**
 * Which build is answering. Vercel sets these at build time; locally they are
 * absent and the fields read "local", which is the honest answer.
 *
 * Worth reporting: the public pages are statically generated, so when
 * something looks stale the first question is always whether the deployment
 * you think is live actually is.
 */
const build = {
  commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  environment: process.env.VERCEL_ENV ?? 'local',
};

/**
 * Uptime probe. Reports the database separately from the process so a monitor
 * can tell "the app is down" from "the app is up but cannot reach Postgres".
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'ok', build });
  } catch {
    // The underlying error can carry the connection string, so it is not echoed.
    return NextResponse.json(
      { status: 'degraded', database: 'unreachable', build },
      { status: 503 },
    );
  }
}
