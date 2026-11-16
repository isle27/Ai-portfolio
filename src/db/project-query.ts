import { asc, eq } from 'drizzle-orm';
import { projects } from './schema';
export function publishedProjectQuery() {
  return {
    where: eq(projects.published, true),
    orderBy: [asc(projects.position), asc(projects.slug)],
  };
}
