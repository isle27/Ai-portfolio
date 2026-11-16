import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
export const projects = pgTable(
  'projects',
  {
    slug: text('slug').primaryKey(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    description: text('description').notNull(),
    overview: text('overview').notNull(),
    stack: text('stack').array().notNull(),
    outcomes: text('outcomes').array().notNull(),
    githubUrl: text('github_url'),
    demoUrl: text('demo_url'),
    position: integer('position').notNull().default(0),
    published: boolean('published').notNull().default(false),
    sample: boolean('sample').notNull().default(true),
  },
  (table) => [
    index('projects_published_order_idx').on(
      table.published,
      table.position,
      table.slug,
    ),
  ],
);
export const submissions = pgTable('contact_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  topic: text('topic').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const rateLimits = pgTable(
  'contact_rate_limits',
  {
    key: text('key').primaryKey(),
    count: integer('count').notNull().default(1),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => [index('rate_limits_expiry_idx').on(table.expiresAt)],
);
export type Project = typeof projects.$inferSelect;
