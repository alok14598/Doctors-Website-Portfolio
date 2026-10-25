import { JsonLd } from '@/components/JsonLd';
import { Card } from '@/components/ui/Card';
import { Section, SectionHeading } from '@/components/layout/Section';
import { CTABand } from '@/components/sections/CTABand';
import { PageHeader } from '@/components/sections/PageHeader';
import { titleCase } from '@/lib/format';
import { faqJsonLd, pageMetadata } from '@/lib/seo';
import { getClinicProfile, getFaqsByCategory, getFaqsFlat } from '@/server/services/clinic.service';

export const metadata = pageMetadata({
  title: 'Patient information',
  description:
    'What to bring to a first visit, how appointment requests work, payment methods, and ' +
    'answers to the questions patients ask most.',
  path: '/patient-info',
});

const FIRST_VISIT_STEPS = [
  {
    title: 'Send a request or call',
    body: 'Use the appointment form or telephone reception. Walk-ins are fine for family medicine; specialist clinics run on fixed days.',
  },
  {
    title: 'We call you back to confirm',
    body: 'Reception rings the number you gave, usually within one working day, and agrees a time with you. The request itself does not hold a slot — the call does.',
  },
  {
    title: 'Bring ID, medicines and past reports',
    body: 'Photo ID, any current medicines in their original packaging, and earlier reports or discharge summaries. For a child, bring the immunisation card.',
  },
  {
    title: 'Arrive about ten minutes early',
    body: 'Enough time to register at reception without eating into your appointment. A general consultation is booked for twenty minutes.',
  },
];

export default async function PatientInfoPage() {
  const [groups, clinic, allFaqs] = await Promise.all([
    getFaqsByCategory(),
    getClinicProfile(),
    getFaqsFlat(),
  ]);

  return (
    <>
      <JsonLd data={faqJsonLd(allFaqs)} />

      <PageHeader
        eyebrow="Patient information"
        title="Before your"
        titleAccent="first visit"
        description="The practical details — what to bring, how long it takes, what it costs, and what we cannot do here."
      />

      <Section>
        <SectionHeading eyebrow="How it works" title="A first visit, step by step" />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2">
          {FIRST_VISIT_STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full p-6">
                <span
                  aria-hidden="true"
                  className="bg-accent-600 flex size-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="text-ink-900 mt-4 font-sans text-base font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="Questions" title="Frequently asked" />

        <div className="mt-10 space-y-10">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="text-accent-700 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
                {titleCase(group.category)}
              </h3>
              <div className="divide-border border-border mt-4 divide-y border-y">
                {group.items.map((faq) => (
                  <details key={faq.id} className="group py-4">
                    <summary className="text-ink-900 cursor-pointer list-none text-base font-medium marker:hidden">
                      <span className="flex items-start justify-between gap-4">
                        {faq.question}
                        <span
                          aria-hidden="true"
                          className="text-accent-700 mt-1 shrink-0 transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {clinic.emergencyNote ? (
        <Section width="narrow">
          <Card className="border-warning-600/25 bg-warning-50 p-6">
            <h2 className="text-warning-600 text-xl">If it is an emergency</h2>
            <p className="text-warning-600 mt-3 text-sm leading-relaxed">{clinic.emergencyNote}</p>
          </Card>
        </Section>
      ) : null}

      <CTABand phone={clinic.phone} />
    </>
  );
}
