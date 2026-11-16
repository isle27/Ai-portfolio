import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { getProjects } from '@/lib/projects';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getProjects();
  return [
    { url: site.url, changeFrequency: 'monthly', priority: 1 },
    ...projects.map((p) => ({
      url: site.url + '/projects/' + p.slug,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
