// Reviewed additive setup, bundled without filesystem access for serverless runtimes.
// Kept in sync with SQL migrations by the database integration test.
export const bootstrapStatements: readonly string[] = String.raw`
CREATE TABLE IF NOT EXISTS "public"."projects" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"overview" text NOT NULL,
	"stack" text[] NOT NULL,
	"outcomes" text[] NOT NULL,
	"github_url" text,
	"demo_url" text,
	"position" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"sample" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."contact_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"topic" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rate_limits_expiry_idx" ON "public"."contact_rate_limits" USING btree ("expires_at");
--> statement-breakpoint
ALTER TABLE "public"."projects" ADD COLUMN IF NOT EXISTS "published" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "public"."projects" ADD COLUMN IF NOT EXISTS "position" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
  IF (SELECT atttypid FROM pg_attribute WHERE attrelid = 'public.projects'::regclass AND attname = 'published' AND NOT attisdropped) <> 'boolean'::regtype THEN
    RAISE EXCEPTION 'public.projects.published must be boolean; existing data was not converted';
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "public"."projects" ALTER COLUMN "published" SET DEFAULT false;
--> statement-breakpoint
UPDATE "public"."projects" SET "published" = false WHERE "published" IS NULL;
--> statement-breakpoint
ALTER TABLE "public"."projects" ALTER COLUMN "published" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "public"."projects" ALTER COLUMN "position" SET DEFAULT 0;
--> statement-breakpoint
UPDATE "public"."projects" SET "position" = 0 WHERE "position" IS NULL;
--> statement-breakpoint
ALTER TABLE "public"."projects" ALTER COLUMN "position" SET NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_published_order_idx" ON "public"."projects" ("published", "position", "slug");
`
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter(Boolean);
