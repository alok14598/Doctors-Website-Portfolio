import Link from 'next/link';
import type { DoctorWithSpecialty } from '@/server/repositories/doctor.repository';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatConsultingDays, formatExperience } from '@/lib/format';
import { ArrowRightIcon } from '@/components/ui/Icon';
import { Avatar } from './Avatar';

export function DoctorCard({ doctor }: { doctor: DoctorWithSpecialty }) {
  return (
    <Card interactive className="flex h-full flex-col p-7">
      <div className="flex items-start gap-4">
        <Avatar name={doctor.name} photoUrl={doctor.photoUrl} />
        <div className="min-w-0">
          <h3 className="text-[1.0625rem] leading-snug font-semibold">
            <Link
              href={`/doctors/${doctor.slug}`}
              className="hover:text-accent-600 transition-colors"
            >
              {doctor.name}
            </Link>
          </h3>
          <p className="text-ink-600 mt-1 text-[15px]">{doctor.designation}</p>
        </div>
      </div>

      <div className="mt-5">
        <Badge tone="accent">{doctor.specialty.name}</Badge>
      </div>

      {/* flex-1 pins the details and link to the bottom, so a card whose
          qualifications wrap to an extra line still lines up with its row. */}
      <p className="text-ink-400 mt-4 flex-1 text-sm">
        {doctor.qualifications.length > 0 ? doctor.qualifications.join(' · ') : null}
      </p>

      <dl className="border-border mt-6 space-y-2 border-t pt-5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-400">Experience</dt>
          <dd className="text-ink-900 text-right">{formatExperience(doctor.experienceYears)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-400">Consults</dt>
          <dd className="text-ink-900 text-right">{formatConsultingDays(doctor.consultingDays)}</dd>
        </div>
      </dl>

      <Link
        href={`/doctors/${doctor.slug}`}
        className="group text-accent-600 mt-5 inline-flex items-center gap-2 text-sm font-semibold"
      >
        Read profile<span className="sr-only"> for {doctor.name}</span>
        <ArrowRightIcon className="ease-smooth size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </Card>
  );
}
