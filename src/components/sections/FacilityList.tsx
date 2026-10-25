import type { Facility } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { IconChip } from '@/components/ui/Pill';
import { FACILITY_CATEGORY_ICONS } from '@/components/ui/Icon';

export const FACILITY_CATEGORY_LABELS: Record<Facility['category'], string> = {
  DIAGNOSTICS: 'Diagnostics & Imaging',
  TREATMENT: 'Treatment Rooms',
  PHARMACY: 'Pharmacy',
  AMENITY: 'Patient Amenities',
};

export function FacilityList({ facilities }: { facilities: Facility[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {facilities.map((facility) => (
        <li key={facility.id}>
          <Card className="flex h-full gap-4 p-6">
            <IconChip icon={FACILITY_CATEGORY_ICONS[facility.category]} tone="soft" />
            <div>
              <h3 className="text-base">{facility.name}</h3>
              <p className="text-ink-600 mt-2 text-[15px] leading-[1.7]">{facility.description}</p>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
