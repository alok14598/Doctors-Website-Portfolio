import { ServicesManager, type ServiceListItem } from '@/components/admin/ServicesManager';
import { listServices } from '@/server/services/service.service';

export const metadata = { title: 'Services' };

export default async function AdminServicesPage() {
  const services = await listServices(true);

  const items: ServiceListItem[] = services.map((service) => ({
    id: service.id,
    name: service.name,
    slug: service.slug,
    category: service.category,
    durationMinutes: service.durationMinutes,
    isActive: service.isActive,
    editorValues: {
      id: service.id,
      name: service.name,
      slug: service.slug,
      summary: service.summary,
      description: service.description,
      category: service.category,
      durationMinutes: service.durationMinutes ?? '',
      preparation: service.preparation ?? '',
      sortOrder: service.sortOrder,
      isActive: service.isActive,
    },
  }));

  return <ServicesManager services={items} />;
}
