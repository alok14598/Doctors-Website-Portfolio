import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';

export const metadata = { title: 'Page not found', robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 items-center">
      <Container width="narrow" className="py-24 text-center">
        <p className="text-accent-700 text-xs font-semibold tracking-[0.14em] uppercase">
          Error 404
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl">We could not find that page</h1>
        <p className="mt-5 text-base leading-relaxed">
          The link may be out of date, or the doctor or service may no longer be listed. The pages
          below cover most of what people come here for.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to the home page</ButtonLink>
          <ButtonLink href="/appointment" variant="secondary">
            Request an appointment
          </ButtonLink>
        </div>

        <nav
          aria-label="Useful links"
          className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm"
        >
          {[
            { href: '/doctors', label: 'Our doctors' },
            { href: '/services', label: 'Services' },
            { href: '/facilities', label: 'Facilities' },
            { href: '/contact', label: 'Contact' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="text-accent-700 hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </main>
  );
}
