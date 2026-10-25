import { DoctorsManager, type DoctorListItem } from '@/components/admin/DoctorsManager';
import { getSpecialties } from '@/server/services/clinic.service';
import { getServiceIdsByDoctor, listDoctors } from '@/server/services/doctor.service';
import { listServices } from '@/server/services/service.service';

export const metadata = { title: 'Doctors' };

export default async function AdminDoctorsPage() {
  const [doctors, specialties, services, servicesByDoctor] = await Promise.all([
    listDoctors({ includeInactive: true }),
    getSpecialties(),
    listServices(true),
    getServiceIdsByDoctor(),
  ]);

  const items: DoctorListItem[] = doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    slug: doctor.slug,
    designation: doctor.designation,
    specialtyName: doctor.specialty.name,
    specialtyId: doctor.specialtyId,
    isActive: doctor.isActive,
    consultingDays: doctor.consultingDays,
    editorValues: {
      id: doctor.id,
      name: doctor.name,
      slug: doctor.slug,
      designation: doctor.designation,
      specialtyId: doctor.specialtyId,
      qualifications: doctor.qualifications.join(', '),
      bio: doctor.bio,
      photoUrl: doctor.photoUrl ?? '',
      experienceYears: doctor.experienceYears,
      languages: doctor.languages.join(', '),
      registrationNo: doctor.registrationNo ?? '',
      consultingDays: doctor.consultingDays,
      consultingHours: doctor.consultingHours ?? '',
      sortOrder: doctor.sortOrder,
      isActive: doctor.isActive,
      serviceIds: servicesByDoctor.get(doctor.id) ?? [],
    },
  }));

  return (
    <DoctorsManager
      doctors={items}
      specialties={specialties.map((specialty) => ({ id: specialty.id, name: specialty.name }))}
      services={services.map((service) => ({ id: service.id, name: service.name }))}
    />
  );
}
