import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { Pill } from '@/components/ui/Pill';
import { ArrowRightIcon, CalendarIcon, PhoneIcon } from '@/components/ui/Icon';

export function CTABand({
  title = 'Ready to see a doctor?',
  description = 'Send us a request and reception will call you back to confirm a time, usually within one working day.',
  phone,
}: {
  title?: string;
  description?: string;
  phone: string;
}) {
  return (
    <section className="reveal bg-surface py-16 sm:py-20">
      <Container>
        <div className="rounded-panel bg-ink-900 relative overflow-hidden px-7 py-14 text-center sm:px-12 sm:py-18">
          <CalendarIcon
            aria-hidden="true"
            className="text-accent-500/10 pointer-events-none absolute -right-12 -bottom-20 size-80"
            strokeWidth={0.6}
          />

          <div className="relative">
            <div className="flex justify-center">
              <Pill tone="white" icon={CalendarIcon}>
                Appointments
              </Pill>
            </div>

            <h2 className="mx-auto mt-6 max-w-2xl text-[1.875rem] text-white sm:text-[2.5rem]">
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-[1.7] text-white/70">
              {description}
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/appointment" size="lg">
                Request an appointment
                <ArrowRightIcon className="size-4.5" />
              </ButtonLink>
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-white/80 transition-colors hover:text-white"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
                  <PhoneIcon className="size-5" />
                </span>
                or call {phone}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
