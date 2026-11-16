import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { ensureDatabase } from '../src/db/setup';
config({ path: '.env.local' });
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');
  await ensureDatabase(process.env.DATABASE_URL);
  await migrate(drizzle(neon(process.env.DATABASE_URL)), {
    migrationsFolder: 'drizzle',
    migrationsSchema: 'drizzle',
    migrationsTable: 'elsa_wubie_migrations',
  });
  console.log('Migrations applied.');
}
main().catch((e) => {
  console.error(
    'Database migration failed. Check connection permissions and schema compatibility.',
    typeof e === 'object' && e !== null && 'code' in e ? String(e.code) : '',
  );
  process.exitCode = 1;
});
