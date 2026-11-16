import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { bootstrapStatements } from '../src/db/bootstrap-statements';
import { projects, submissions } from '../src/db/schema';
import { publishedProjectQuery } from '../src/db/project-query';
import { sampleProjects } from '../src/lib/sample-projects';
async function setup(pg: PGlite) {
  await pg.transaction(async (tx) => {
    for (const statement of bootstrapStatements) await tx.exec(statement);
  });
}
test('empty database is initialized, filtering/order are enforced, and setup preserves shared data', async () => {
  const pg = new PGlite();
  try {
    await setup(pg);
    const db = drizzle(pg);
    const columns = await pg.query<{ data_type: string; is_nullable: string }>(
      "select data_type,is_nullable from information_schema.columns where table_schema='public' and table_name='projects' and column_name='published'",
    );
    assert.deepEqual(columns.rows, [
      { data_type: 'boolean', is_nullable: 'NO' },
    ]);
    const tables = await pg.query<{ count: number }>(
      "select count(*)::integer from information_schema.tables where table_schema='public' and table_name in ('projects','contact_submissions','contact_rate_limits')",
    );
    assert.equal(tables.rows[0].count, 3);
    const base = sampleProjects[0];
    await db.insert(projects).values([
      { ...base, slug: 'z-last', position: 9, published: true },
      { ...base, slug: 'b-second', position: 1, published: true },
      { ...base, slug: 'a-first', position: 1, published: true },
      { ...base, slug: 'hidden', position: 0, published: false },
    ]);
    await pg.exec(
      "create table unrelated_portfolio (id integer primary key, content text); insert into unrelated_portfolio values (1,'keep me')",
    );
    await db.insert(submissions).values({
      name: 'Alex',
      email: 'alex@example.com',
      topic: 'Research',
      message: 'A message that must survive repeat setup.',
    });
    await setup(pg);
    await setup(pg);
    const query = publishedProjectQuery();
    const visible = await db
      .select()
      .from(projects)
      .where(query.where)
      .orderBy(...query.orderBy);
    assert.deepEqual(
      visible.map((p) => p.slug),
      ['a-first', 'b-second', 'z-last'],
    );
    assert.equal((await db.select().from(projects)).length, 4);
    assert.equal((await db.select().from(submissions)).length, 1);
    assert.equal(
      (
        await pg.query<{ content: string }>(
          'select content from unrelated_portfolio',
        )
      ).rows[0].content,
      'keep me',
    );
    const { published: _published, ...draft } = base;
    void _published;
    await db.insert(projects).values({ ...draft, slug: 'default-draft' });
    assert.equal(
      (
        await pg.query<{ published: boolean }>(
          "select published from projects where slug='default-draft'",
        )
      ).rows[0].published,
      false,
    );
    await pg.exec(
      "alter table projects alter column published drop not null; alter table projects alter column position drop not null; update projects set published=null,position=null where slug='hidden'",
    );
    await setup(pg);
    assert.deepEqual(
      (
        await pg.query<{ published: boolean; position: number }>(
          "select published,position from projects where slug='hidden'",
        )
      ).rows,
      [{ published: false, position: 0 }],
    );
    assert.equal(
      (
        await pg.query<{ published: boolean }>(
          "select published from projects where slug='a-first'",
        )
      ).rows[0].published,
      true,
    );
  } finally {
    await pg.close();
  }
});
test('legacy projects table receives missing publication and ordering columns without publishing existing work', async () => {
  const pg = new PGlite();
  try {
    await pg.exec(
      "create table projects (slug text primary key,title text not null,category text not null,description text not null,overview text not null,stack text[] not null,outcomes text[] not null,github_url text,demo_url text,sample boolean default false not null); insert into projects (slug,title,category,description,overview,stack,outcomes) values ('legacy','Existing project','Research','Preserve description','Preserve overview','{}','{}')",
    );
    await setup(pg);
    const rows = await pg.query<{
      published: boolean;
      position: number;
      description: string;
    }>(
      "select published,position,description from projects where slug='legacy'",
    );
    assert.deepEqual(rows.rows, [
      { published: false, position: 0, description: 'Preserve description' },
    ]);
    const db = drizzle(pg);
    const query = publishedProjectQuery();
    assert.equal(
      (await db.select().from(projects).where(query.where)).length,
      0,
    );
  } finally {
    await pg.close();
  }
});
test('incompatible shared table is rejected atomically rather than converting existing data', async () => {
  const pg = new PGlite();
  try {
    await pg.exec(
      "create table projects (slug text primary key,published text); insert into projects values ('other-portfolio','yes')",
    );
    await assert.rejects(setup(pg), /must be boolean/);
    assert.equal(
      (await pg.query<{ published: string }>('select published from projects'))
        .rows[0].published,
      'yes',
    );
    assert.equal(
      (
        await pg.query<{ name: string | null }>(
          "select to_regclass('public.contact_submissions')::text as name",
        )
      ).rows[0].name,
      null,
    );
  } finally {
    await pg.close();
  }
});
test('first-use bootstrap matches the reviewed migration statements', () => {
  const statements = ['0000_initial', '0001_project_publication'].flatMap(
    (name) =>
      readFileSync('drizzle/' + name + '.sql', 'utf8')
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter(Boolean),
  );
  assert.deepEqual(bootstrapStatements, statements);
});
