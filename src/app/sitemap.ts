import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { listDoctorSlugs } from '@/server/services/doctor.service';
import { listServiceSlugs } from '@/server/services/service.service';

const STATIC_PATHS = [
  { path: '/', priority: 1 },
  { path: '/appointment', priority: 0.9 },
  { path: '/doctors', priority: 0.8 },
  { path: '/services', priority: 0.8 },
  { path: '/facilities', priority: 0.7 },
  { path: '/about', priority: 0.6 },
  { path: '/patient-info', priority: 0.6 },
  { path: '/contact', priority: 0.7 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [doctorSlugs, serviceSlugs] = await Promise.all([listDoctorSlugs(), listServiceSlugs()]);
  const lastModified = new Date();

  return [
    ...STATIC_PATHS.map((entry) => ({
      url: absoluteUrl(entry.path),
      lastModified,
      priority: entry.priority,
    })),
    ...doctorSlugs.map((slug) => ({
      url: absoluteUrl(`/doctors/${slug}`),
      lastModified,
      priority: 0.7,
    })),
    ...serviceSlugs.map((slug) => ({
      url: absoluteUrl(`/services/${slug}`),
      lastModified,
      priority: 0.7,
    })),
  ];
}
