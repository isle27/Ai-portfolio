import { neon } from '@neondatabase/serverless';
import { bootstrapStatements } from './bootstrap-statements';
export { bootstrapStatements } from './bootstrap-statements';
// One initialization per connection per process. Failed attempts can be retried.
const initialized = new Map<string, Promise<void>>();
export function ensureDatabase(url: string): Promise<void> {
  const existing = initialized.get(url);
  if (existing) return existing;
  const sql = neon(url);
  const pending = sql
    .transaction([
      sql`select pg_advisory_xact_lock(hashtext('elsa-wubie:public-schema-setup'))`,
      ...bootstrapStatements.map((statement) => sql.query(statement)),
    ])
    .then(() => undefined)
    .catch((error) => {
      initialized.delete(url);
      throw error;
    });
  initialized.set(url, pending);
  return pending;
}
