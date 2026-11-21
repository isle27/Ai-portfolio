import 'server-only';
import { cache } from 'react';
import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import type { Project } from '@/db/schema';
export const getProjects = cache(async function getProjects() {
  if (!process.env.DATABASE_URL)
    return { projects: [], mode: 'error' as const };
  try {
    const result = await getDb().execute<Project & { image: string }>(sql`
      SELECT project_slug AS slug, title, description,
        CASE WHEN show_on_se AND image LIKE '/%' THEN 'https://elsadev.chanyalew.com' || image ELSE image END AS image,
        COALESCE(NULLIF(ai_category, ''), 'Project') AS category,
        COALESCE(NULLIF(ai_overview, ''), description) AS overview,
        technologies AS stack, ai_outcomes AS outcomes,
        github AS "githubUrl", live AS "demoUrl", sort_order AS position,
        true AS published, ai_sample AS sample
      FROM public.portfolio_published_projects
      WHERE show_on_ai
      ORDER BY sort_order, id
    `);
    return {
      projects: result.rows,
      mode: 'live' as const,
    };
  } catch {
    console.error('Project query failed');
    return { projects: [], mode: 'error' as const };
  }
});
