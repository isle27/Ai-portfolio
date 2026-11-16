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
