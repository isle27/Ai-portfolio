import 'server-only';
import { getReadyDb } from '@/db';
import { publishedProjectQuery } from '@/db/project-query';
import { projects } from '@/db/schema';
import { sampleProjects } from './sample-projects';
export async function getProjects() {
  if (!process.env.DATABASE_URL)
    return {
      projects: sampleProjects
        .filter((p) => p.published === true)
        .sort(
          (a, b) => a.position - b.position || a.slug.localeCompare(b.slug),
        ),
      mode: 'preview' as const,
    };
  try {
    const db = await getReadyDb();
    const query = publishedProjectQuery();
    return {
      projects: await db
        .select()
        .from(projects)
        .where(query.where)
        .orderBy(...query.orderBy),
      mode: 'live' as const,
    };
  } catch {
    console.error('Project query failed');
    return { projects: [], mode: 'error' as const };
  }
}
