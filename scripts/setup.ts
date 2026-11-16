import { config } from 'dotenv';
import { ensureDatabase } from '../src/db/setup';
config({ path: '.env.local' });
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Set DATABASE_URL in .env.local');
  await ensureDatabase(url);
  console.log('Portfolio tables are ready. Existing records preserved.');
}
main().catch(() => {
  console.error(
    'Database setup failed. Check DATABASE_URL, CREATE/ALTER permissions, and table compatibility.',
  );
  process.exitCode = 1;
});
