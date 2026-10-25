import type { ReactNode } from 'react';

export const metadata = {
  title: 'Staff area',
  // The admin area must never appear in search results.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="bg-surface-2 flex min-h-dvh flex-col">{children}</div>;
}
