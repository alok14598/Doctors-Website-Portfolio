import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { siteUrl } from '@/lib/seo';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Meridian Family Clinic — Everyday care, delivered carefully',
    template: '%s · Meridian Family Clinic',
  },
  description:
    'A family clinic in Koramangala, Bengaluru, with six consultants, on-site diagnostics and ' +
    'an in-house pharmacy. Request an appointment online.',
  authors: [{ name: 'Meridian Family Clinic' }],
  formatDetection: { telephone: true, address: true },
};

export const viewport: Viewport = {
  themeColor: '#1668d6',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="focus:rounded-pill focus:bg-accent-600 sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
