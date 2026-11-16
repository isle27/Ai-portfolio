import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { ensureDatabase } from '../src/db/setup';
import { projects } from '../src/db/schema';
import { sampleProjects } from '../src/lib/sample-projects';
config({ path: '.env.local' });
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');
  await ensureDatabase(process.env.DATABASE_URL);
  await drizzle(neon(process.env.DATABASE_URL))
    .insert(projects)
    .values(sampleProjects)
    .onConflictDoNothing();
  console.log('Sample projects seeded; existing records preserved.');
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
