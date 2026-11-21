import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { ensureDatabase } from './setup';
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Database is not configured');
  return drizzle(
    neon(url, { fetchOptions: { signal: AbortSignal.timeout(5000) } }),
    {
      schema,
    },
  );
}

export async function getReadyDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Database is not configured');
  await ensureDatabase(url);
  return getDb();
}
