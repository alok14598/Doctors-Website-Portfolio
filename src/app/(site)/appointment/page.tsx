import { Card } from '@/components/ui/Card';
import { Section } from '@/components/layout/Section';
import { AppointmentForm } from '@/components/sections/AppointmentForm';
import { HoursTable } from '@/components/sections/HoursTable';
import { PageHeader } from '@/components/sections/PageHeader';
import { pageMetadata } from '@/lib/seo';
import { getClinicProfile, getOpeningHours } from '@/server/services/clinic.service';
import { listDoctors } from '@/server/services/doctor.service';
import { listServices } from '@/server/services/service.service';

export const metadata = pageMetadata({
  title: 'Request an appointment',
  description:
    'Send an appointment request to Meridian Family Clinic. Reception calls you back to ' +
    'confirm a time, usually within one working day.',
  path: '/appointment',
});

type Props = { searchParams: Promise<{ doctor?: string }> };

export default async function AppointmentPage({ searchParams }: Props) {
  const [{ doctor: requestedDoctorId }, clinic, openingHours, doctors, services] =
    await Promise.all([
      searchParams,
      getClinicProfile(),
      getOpeningHours(),
      listDoctors(),
      listServices(),
    ]);

  // Only pre-select a doctor who actually practises here.
  const defaultDoctorId = doctors.some((doctor) => doctor.id === requestedDoctorId)
    ? requestedDoctorId
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Appointments"
        title="Request an"
        titleAccent="appointment"
        description="Tell us when suits you and who you would like to see. Reception calls you back to confirm — the request itself does not hold a slot."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <Card className="p-6 sm:p-8">
            <AppointmentForm
              doctors={doctors.map((doctor) => ({
                id: doctor.id,
                name: `${doctor.name} — ${doctor.specialty.name}`,
              }))}
              services={services.map((service) => ({ id: service.id, name: service.name }))}
              defaultDoctorId={defaultDoctorId}
            />
          </Card>

          <div className="space-y-5">
            <Card className="p-6">
              <h2 className="text-lg">Need to be seen today?</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Walk-ins are welcome for family medicine during clinic hours. Call reception first
                if you can — they will tell you how busy it is.
              </p>
              <p className="mt-4 text-sm">
                <a
                  href={`tel:${clinic.phone.replace(/\s/g, '')}`}
                  className="text-accent-700 font-medium hover:underline"
                >
                  {clinic.phone}
                </a>
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg">Opening hours</h2>
              <div className="mt-4">
                <HoursTable openingHours={openingHours} />
              </div>
            </Card>

            {clinic.emergencyNote ? (
              <Card className="border-warning-600/25 bg-warning-50 p-6">
                <h2 className="text-warning-600 text-lg">In an emergency</h2>
                <p className="text-warning-600 mt-3 text-sm leading-relaxed">
                  {clinic.emergencyNote}
                </p>
              </Card>
            ) : null}
          </div>
        </div>
      </Section>
    </>
  );
}
