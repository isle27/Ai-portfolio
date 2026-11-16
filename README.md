# Elsa Wubie — AI Engineer

A quiet editorial portfolio in warm porcelain, soft stone, muted taupe, and gentle charcoal. Built with Next.js 15 App Router, strict TypeScript, Tailwind, Framer Motion, Neon Postgres, and Drizzle ORM. Fonts are self-hosted Newsreader and DM Sans. All project graphics are lightweight original SVGs; no stock imagery or remote font requests.

## Quick start

Requires Node.js 22+ and npm. On Windows PowerShell use npm.cmd if script execution is restricted.

1. Run npm install (or npm ci when using the committed lockfile).
2. Copy .env.example to .env.local.
3. Run npm run dev and open http://localhost:3000.

Without DATABASE_URL, the site runs in explicitly labeled preview mode with four illustrative project concepts. The contact form never pretends to save a real submission when the database is unavailable. With a configured database, projects are read from Neon on each request; database errors show a graceful unavailable state rather than silently substituting sample content.

## Neon setup

1. Create a project at https://console.neon.tech and copy its pooled Postgres connection URL, including sslmode=require, to DATABASE_URL in .env.local. Keep credentials server-only.
2. Set CONTACT_RATE_LIMIT_SECRET to a stable random value of at least 32 characters. Generate one with node -e "console.log(require('crypto').randomBytes(32).toString('hex'))".
3. Run npm run db:setup to create missing tables and add missing publication/order columns safely, or npm run db:migrate to also record/apply versioned migrations. The app also performs this setup automatically before its first database operation; tables do not need to exist beforehand.
4. Optionally run npm run db:seed to insert sample projects. This preserves existing records. Samples remain labeled as concepts.
5. Use npm run db:studio to edit project data. New projects default to unpublished. Set published=true when reviewed, sample=false only for verified work, and use real HTTPS github_url and demo_url values. Only published=true records are fetched. Lower position values appear first; slug ascending breaks ties, so the order is deterministic. Keep slugs URL-safe and stable.
6. For schema changes, update src/db/schema.ts, run npm run db:generate, review the generated SQL, and run npm run db:migrate.

Tables: public.projects, public.contact_submissions, public.contact_rate_limits. Setup uses CREATE TABLE IF NOT EXISTS and additive ALTER TABLE statements in a locked transaction. Existing records and unrelated tables are preserved. Missing published columns are boolean NOT NULL DEFAULT false; legacy NULL values become false. Nothing is automatically seeded or published. A non-boolean existing published column fails setup without converting data. The shared connection role must have CREATE/ALTER permissions for these tables. Initialization is cached per server process, and failures are retried on later requests. Drizzle migration history uses drizzle.elsa_wubie_migrations, separate from other apps’ default journals. These standard public table names are deliberately retained for compatibility; compatible portfolios using them share the same records. Contact messages are private and never exposed through a read endpoint. Contact form uses Zod validation, a honeypot, Next Server Action origin protections, and an atomic Postgres upsert limiting a bucket to five attempts per hour. On Vercel the trusted platform IP header determines a privacy-preserving HMAC bucket. Other hosts deliberately share one conservative bucket: configure a trusted host-specific IP source before serving higher traffic. Never trust arbitrary client-forwarded IP headers. Consider a managed bot challenge for high abuse traffic. Expired buckets can be deleted periodically with DELETE FROM contact_rate_limits WHERE expires_at < now(). Apply an appropriate retention policy to contact messages.

## Personalize before publishing

The only supplied personal facts were Elsa’s name and role. The project examples are illustrative; there are no invented employers, performance metrics, client logos, or public profile links. About and expertise copy are proposed editorial content for Elsa’s review. The experience section intentionally shows a working philosophy in place of an unverified career history; replace it with verified roles, dates, and achievements when available.

- Replace sample project records with actual work, links, and measured outcomes.
- Confirm the bio, expertise, and experience content in src/app/page.tsx.
- Set NEXT_PUBLIC_CONTACT_EMAIL, NEXT_PUBLIC_GITHUB_URL, NEXT_PUBLIC_LINKEDIN_URL, and NEXT_PUBLIC_X_URL to verified values. Unconfigured links are omitted.
- Set NEXT_PUBLIC_SITE_URL to the canonical HTTPS URL before building. This controls canonical metadata, sitemap, robots, and social previews. Never deploy with localhost as the canonical URL.
- Adjust the palette through CSS variables in src/app/globals.css.

## Commands

- npm run dev — local development
- npm run build / npm start — production server
- npm run typecheck — TypeScript
- npm run lint — Next.js accessibility and React checks
- npm test — real PostgreSQL engine setup/filter/order tests plus validation and safe external link tests
- npm run test:e2e — desktop and mobile browser smoke tests (run npm run build and npx playwright install chromium first)
- npm run format:check — source formatting
- npm run db:setup / db:generate / db:migrate / db:seed / db:studio — database workflow

## Architecture

src/app contains routes, metadata, and the contact Server Action. src/components contains reusable UI and small client-side interaction islands. src/lib holds server-only data access, shared validation, configuration, and preview content. src/db defines the Drizzle schema and lazy Neon HTTP client. scripts contains migration and seed commands. drizzle contains reviewed SQL migrations.

Projects use dynamic server rendering to reflect database edits immediately. Filtering runs locally over public project records. Contact submission uses React 19 useActionState with pending, error, inline validation, and success feedback. Missing database credentials do not break the build. Framer Motion reveals are viewport-triggered and honor reduced motion. The tonal folded-paper study uses original SVG and a restrained spring-based pointer response. Next.js development indicators are disabled in next.config.ts. No custom cursor interferes with native interaction.

## Deployment

Deploy to a Node-compatible Next.js host such as Vercel. Connect this repository, use the Next.js preset, set all environment variables from .env.example, and run migrations against the production Neon branch before the first release. Use a separate Neon branch for preview deployments. The standard build command is npm run build; output is the .next-production server build (isolated from the .next development cache), not a static export. NEXT_PUBLIC_* values are embedded at build time, so rebuild after changing them. Keep DATABASE_URL and CONTACT_RATE_LIMIT_SECRET in the host’s secret manager. No deployment or hosted Neon resource is created by this repository.

## Verification

Run npm run typecheck, npm run lint, npm test, and npm run build. For a live integration check, configure a disposable Neon branch, run migration and seed, open the site, filter projects, visit a detail page, and submit a message. Verify one matching contact_submissions row; the sixth attempt within an hour must be rejected. Confirm a failed database request never yields a success confirmation. Check keyboard-only navigation, reduced motion, 360px mobile and wide desktop layouts before release. Database tests use an isolated PGlite PostgreSQL engine to verify first-time setup, repeatability, existing-table upgrades, shared-data preservation, draft filtering, and deterministic ordering. They never connect to Neon. Live Neon verification still requires credentials.

Design decisions: regular-weight literary serif headings; a small signature wordmark; original folded-paper artwork; softly toned system diagrams; balanced project pairs; open expertise layouts; warm, closely related surfaces; visible keyboard focus states; and reduced-motion support. Useful references: [Next.js 15 data security](https://nextjs.org/docs/15/app/guides/data-security) and [Drizzle with Neon](https://orm.drizzle.team/docs/connect-neon).

## Hero, companion, and contact delivery

The hero uses Elsa's supplied real portrait at `public/images/elsa-portrait.jpg`, rendered with Next Image and priority loading. On mobile the portrait appears before the headline. The supplied robot reference is retained at `public/images/robot-reference.jpg`. SVG clips articulate the central robot's head and arms independently; a color matrix maps the original blue shell to baby pink and removes the white backdrop. This preserves the supplied design rather than substituting a different character. The robot visibly waves, turns its head, looks up, and floats gently. A muted neural network animates behind the hero. All motion honors reduced-motion preferences.

The contact area now offers two separate, keyboard-accessible tabs. Each preserves its draft when switching:

- **Email / contact form** sends email via Resend. A public mailto link is also shown when a contact email is configured.
- **Chatbot** is an automated portfolio guide with curated answers and a conversational message flow. It sends the visitor's reviewed message directly to Elsa's private Telegram chat. It is not an LLM or live two-way chat. Elsa can reply separately using the visitor's supplied email.

Both delivery paths use server-only credentials, input validation, a honeypot, and the existing atomic database rate limiter. Messages are not saved as contact submissions. Telegram success requires the API's explicit `ok: true`; email success requires an accepted email ID. Provider failures never show a delivery confirmation. A timeout may leave delivery uncertain; manually retrying could deliver a duplicate.

Set these values in `.env.local` and your deployment's secret manager. Only the public contact email is intended for the browser:

| Variable                    | Purpose                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`              | Neon connection for durable rate limits and existing project data.                                                |
| `CONTACT_RATE_LIMIT_SECRET` | Stable random value of at least 32 characters.                                                                    |
| `TELEGRAM_BOT_TOKEN`        | Bot token from Telegram's official @BotFather.                                                                    |
| `TELEGRAM_CHAT_ID`          | Your private chat's numeric ID; start a conversation with your bot first, then inspect its `getUpdates` response. |
| `RESEND_API_KEY`            | Server-only Resend API key for the email form.                                                                    |
| `CONTACT_FROM_EMAIL`        | Sender address on your verified Resend domain.                                                                    |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Elsa's recipient email and public mailto address.                                                                 |

Provider references: [Telegram sendMessage](https://core.telegram.org/bots/api#sendmessage) and [Resend email delivery](https://resend.com/docs/api-reference/emails/send-email). Requests time out after ten seconds. The 3,500-character visitor message limit leaves room for contact details in Telegram's 4,096-character limit. The rate limiter permits five delivery attempts per hour per bucket, including failures. On Vercel, a trusted platform IP header selects an HMAC bucket; other hosts deliberately share one conservative bucket.

This replaces the contact-storage behavior described in the original architecture notes above. No live email or Telegram delivery can be verified until owner credentials are configured. Before publishing, send one message through each option and confirm receipt in the correct destination.
