import Link from 'next/link';
import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { SignOutButton } from '@/components/admin/SignOutButton';
import { Container } from './Container';

export function AdminShell({ children, userName }: { children: ReactNode; userName: string }) {
  return (
    <>
      <header className="border-border bg-surface border-b">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/appointments"
              className="text-ink-900 text-[15px] font-semibold tracking-[-0.02em]"
            >
              Meridian · Staff
            </Link>
            <AdminNav />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-ink-400 hidden text-sm sm:block">{userName}</span>
            <Link href="/" className="text-ink-600 hover:text-ink-900 hidden text-sm sm:block">
              View site
            </Link>
            <SignOutButton />
          </div>
        </Container>
      </header>

      <main id="main" className="flex-1 py-10">
        <Container>{children}</Container>
      </main>
    </>
  );
}
