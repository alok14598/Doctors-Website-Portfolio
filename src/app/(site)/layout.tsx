import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { TopBar } from '@/components/layout/TopBar';
import { getClinicProfile, getOpeningHours } from '@/server/services/clinic.service';

/**
 * The public shell. Clinic details are read once here and passed down, so the
 * header and footer never each query for them.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [clinic, openingHours] = await Promise.all([getClinicProfile(), getOpeningHours()]);

  return (
    <>
      <TopBar clinic={clinic} openingHours={openingHours} />
      <Header clinicName={clinic.name} phone={clinic.phone} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer clinic={clinic} openingHours={openingHours} />
    </>
  );
}
