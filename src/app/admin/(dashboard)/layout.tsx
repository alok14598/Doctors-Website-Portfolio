import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { auth } from '@/lib/auth';

/**
 * The real access check. `middleware.ts` only sees whether a session cookie
 * exists; this verifies the session itself, which is what actually keeps the
 * admin pages closed.
 */
export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/admin/login');

  return (
    <AdminShell userName={session.user.name ?? session.user.email ?? 'Staff'}>
      {children}
    </AdminShell>
  );
}
