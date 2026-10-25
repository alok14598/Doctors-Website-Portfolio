import Image from 'next/image';
import type { ClinicProfile } from '@prisma/client';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { Pill, IconChip } from '@/components/ui/Pill';
import { ArrowRightIcon, HeartPulseIcon, ShieldIcon, UsersIcon } from '@/components/ui/Icon';
import { isLocalImagePath } from '@/lib/schemas/common';

/**
 * One rounded panel carrying the headline, the primary action and two floating
 * stat cards.
 *
 * `heroImageUrl` is optional by design: with a photograph the panel matches the
 * reference exactly, and without one it falls back to a blue gradient wash with
 * a watermark glyph — finished-looking rather than visibly missing an asset.
 * No stock portrait is substituted, because an invented face beside a real
 * clinic's name misleads patients.
 */
export function Hero({
  clinic,
  stats,
}: {
  clinic: ClinicProfile;
  /** Exactly two entries are rendered as the floating cards. */
  stats: { label: string; value: string; caption: string }[];
}) {
  const [primaryStat, secondaryStat] = stats;

  // next/image throws on a host it has not been configured for, so an
  // unusable path falls back to the gradient rather than taking the page down.
  const heroImage =
    clinic.heroImageUrl && isLocalImagePath(clinic.heroImageUrl) ? clinic.heroImageUrl : null;

  return (
    <section className="bg-surface pt-6 pb-24 sm:pb-28">
      <Container>
        <div className="rounded-panel from-accent-50 via-surface-2 to-accent-100 relative overflow-hidden bg-gradient-to-br">
          {heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1152px"
              className="object-cover object-right"
            />
          ) : (
            <HeartPulseIcon
              className="text-accent-500/15 pointer-events-none absolute -right-10 -bottom-16 size-[22rem] sm:size-[28rem]"
              strokeWidth={0.6}
            />
          )}

          {/* Only needed over a photograph — on the gradient it would wash the
              panel out to near-white. */}
          {heroImage ? (
            <div className="from-surface/96 via-surface/85 absolute inset-0 bg-gradient-to-r to-transparent" />
          ) : null}

          <div className="relative px-7 py-14 sm:px-12 sm:py-18 lg:py-20">
            <div className="max-w-2xl">
              <Pill tone="white" icon={ShieldIcon}>
                Your health, our priority
              </Pill>

              <h1 className="mt-7 text-[2.25rem] sm:text-5xl lg:text-[3.5rem]">
                {clinic.heroTitle ?? clinic.tagline}
                {clinic.heroTitleAccent ? (
                  <>
                    {' '}
                    <span className="heading-accent">{clinic.heroTitleAccent}</span>
                  </>
                ) : null}
              </h1>

              <p className="text-ink-600 mt-6 max-w-xl text-[17px] leading-[1.7]">
                {clinic.about.split('\n\n')[0]}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/appointment" size="lg">
                  Book appointment
                  <ArrowRightIcon className="size-4.5" />
                </ButtonLink>
                <ButtonLink href="/doctors" variant="secondary" size="lg">
                  Meet the doctors
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>

        {/* The cards overlap the panel's lower edge, which is what gives the
            section its depth. They stack under the panel on small screens. */}
        <div className="relative z-10 -mt-10 grid gap-5 px-2 sm:-mt-14 sm:grid-cols-2 sm:px-8 lg:px-14">
          {primaryStat ? (
            <article className="rounded-card bg-surface shadow-float flex items-center gap-4 p-6">
              <IconChip icon={UsersIcon} size="lg" tone="soft" />
              <div>
                <p className="text-ink-900 text-3xl font-extrabold tracking-[-0.02em]">
                  {primaryStat.value}
                </p>
                <p className="text-ink-600 text-sm font-medium">{primaryStat.label}</p>
                <p className="text-ink-400 mt-1 text-[13px]">{primaryStat.caption}</p>
              </div>
            </article>
          ) : null}

          {secondaryStat ? (
            <article className="rounded-card bg-surface shadow-float flex items-center gap-4 p-6">
              <IconChip icon={HeartPulseIcon} size="lg" tone="soft" />
              <div>
                <p className="text-ink-900 text-3xl font-extrabold tracking-[-0.02em]">
                  {secondaryStat.value}
                </p>
                <p className="text-ink-600 text-sm font-medium">{secondaryStat.label}</p>
                <p className="text-ink-400 mt-1 text-[13px]">{secondaryStat.caption}</p>
              </div>
            </article>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
