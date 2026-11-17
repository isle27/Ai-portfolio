# Elsa Wubie — AI Engineer

A quiet editorial portfolio in warm porcelain, soft stone, muted taupe, and gentle charcoal. Built with Next.js 15 App Router, strict TypeScript, Tailwind, Framer Motion, Neon Postgres, and Drizzle ORM. Fonts are self-hosted Newsreader and DM Sans. All project graphics are lightweight original SVGs; no stock imagery or remote font requests.

## Quick start

Requires Node.js 22+ and npm. On Windows PowerShell use npm.cmd if script execution is restricted.

1. Run npm install (or npm ci when using the committed lockfile).
2. Copy .env.example to .env.local.
3. Run npm run dev and open http://localhost:3000.

Without DATABASE_URL, the site runs in explicitly labeled preview mode with four illustrative project concepts. With a configured database, projects are read from Neon on each request; database errors show a graceful unavailable state rather than silently substituting sample content.

## Neon setup

1. Create a project at https://console.neon.tech and copy its pooled Postgres connection URL, including sslmode=require, to DATABASE_URL in .env.local. Keep credentials server-only.
2. Run npm run db:setup to create missing tables and add missing publication/order columns safely, or npm run db:migrate to also record/apply versioned migrations. The app also performs this setup automatically before its first database operation; tables do not need to exist beforehand.
3. Optionally run npm run db:seed to insert sample projects. This preserves existing records. Samples remain labeled as concepts.
4. Use npm run db:studio to edit project data. New projects default to unpublished. Set published=true when reviewed, sample=false only for verified work, and use real HTTPS github_url and demo_url values. Only published=true records are fetched. Lower position values appear first; slug ascending breaks ties, so the order is deterministic. Keep slugs URL-safe and stable.
5. For schema changes, update src/db/schema.ts, run npm run db:generate, review the generated SQL, and run npm run db:migrate.

Tables: public.projects, public.contact_submissions, public.contact_rate_limits. Setup uses CREATE TABLE IF NOT EXISTS and additive ALTER TABLE statements in a locked transaction. Existing records and unrelated tables are preserved. Missing published columns are boolean NOT NULL DEFAULT false; legacy NULL values become false. Nothing is automatically seeded or published. A non-boolean existing published column fails setup without converting data. The shared connection role must have CREATE/ALTER permissions for these tables. Initialization is cached per server process, and failures are retried on later requests. Drizzle migration history uses drizzle.elsa_wubie_migrations, separate from other apps’ default journals. These standard public table names are deliberately retained for compatibility; compatible portfolios using them share the same records. Legacy contact tables are retained for database compatibility; the current site uses only direct email links and does not accept contact submissions.

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

src/app contains routes and metadata. src/components contains reusable UI and small client-side interaction islands. src/lib holds server-only data access, shared validation, configuration, and preview content. src/db defines the Drizzle schema and lazy Neon HTTP client. scripts contains migration and seed commands. drizzle contains reviewed SQL migrations.

Projects use dynamic server rendering to reflect database edits immediately. Filtering runs locally over public project records. Contact uses standard mailto links to open the visitor's email app. Missing database credentials do not break the build. Framer Motion reveals are viewport-triggered and honor reduced motion. The tonal folded-paper study uses original SVG and a restrained spring-based pointer response. Next.js development indicators are disabled in next.config.ts. No custom cursor interferes with native interaction.

## Deployment

Deploy to a Node-compatible Next.js host such as Vercel. Connect this repository, use the Next.js preset, set all environment variables from .env.example, and run migrations against the production Neon branch before the first release. Use a separate Neon branch for preview deployments. The standard build command is npm run build; Vercel uses its standard .next output directory; local production builds use .next-production to stay separate from the development cache. This is a server build, not a static export. In Vercel, keep Framework Preset set to Next.js and disable any Output Directory override. NEXT_PUBLIC_* values are embedded at build time, so rebuild after changing them. Keep DATABASE_URL in the host’s secret manager. No deployment or hosted Neon resource is created by this repository.

## Verification

Run npm run typecheck, npm run lint, npm test, and npm run build. For a live integration check, configure a disposable Neon branch, run migration and seed, open the site, filter projects, visit a detail page, and verify the email links open the correct recipient in your email app. Check keyboard-only navigation, reduced motion, 360px mobile and wide desktop layouts before release. Database tests use an isolated PGlite PostgreSQL engine to verify first-time setup, repeatability, existing-table upgrades, shared-data preservation, draft filtering, and deterministic ordering. They never connect to Neon. Live Neon verification still requires credentials.

Design decisions: regular-weight literary serif headings; a small signature wordmark; original folded-paper artwork; softly toned system diagrams; balanced project pairs; open expertise layouts; warm, closely related surfaces; visible keyboard focus states; and reduced-motion support. Useful references: [Next.js 15 data security](https://nextjs.org/docs/15/app/guides/data-security) and [Drizzle with Neon](https://orm.drizzle.team/docs/connect-neon).

## Hero, companion, and contact delivery

The hero uses Elsa's supplied real portrait at `public/images/elsa-portrait.jpg`, rendered with Next Image and priority loading. On mobile it appears before the headline. The baby-pink companion follows the latest rounded-helmet reference, with an inset black visor, mint oval eyes, a simple belly band, full legs, soft palms, and five rounded fingers. It renders as transparent SVG without bitmap cutouts.

`src/lib/robot-spatial.ts` defines the skeleton's rigid transforms and fixed-length joints. `src/lib/robot-model.ts` builds the complete articulated character and projects its rounded forms into SVG. One shared body orientation drives the helmet, visor, facial features, torso, arms, and legs. The face is geometry on the helmet surface; there are no independent head-view swaps, flat profile cutouts, scale-based flips, or separate head yaw. Small local head pitch and roll provide overlapping action without disconnecting the neck or face. Depth ordering makes near/far limbs and solid helmet volume behave consistently through a full turn.

`src/components/companion-rig.ts` controls walking, braking, settling, planted pivots, waving, and waiting. A planted foot anchors the whole-body turn while the other foot steps around it. Supporting shoe surfaces remain on the same ground plane. Arms counter the legs, and the wave moves a connected forearm, palm, and fingers. Mouse input is damped into small reactive movements. After nine seconds of inactivity, the bot docks at the screen's right side and paces horizontally toward the left edge and back, in side profile with its hands behind its back. Mouse, touch, keyboard, or scroll activity interrupts the patrol: the whole character turns right and runs back to its corner before resuming normal reactions. Project hover selects larger curious eyes, raised brows, and a broader positive smile. When walking away, the whole character faces away; after stopping, the whole character turns to show the expression, rather than rotating the face independently.

`src/components/scroll-companion.tsx` places one decorative companion beside the portrait, moves it to the side after 24 pixels of scrolling, and returns it to the portrait at the top. It uses a portal so page transitions cannot trap its fixed positioning. Mobile uses a smaller companion. Early hover is initialized even if it happens before hydration finishes, and the renderer rebinds refreshed SVG nodes to avoid frozen animation after live updates. The layer captures neither clicks nor focus. Animation pauses when hidden, reduced motion uses a static pose, and listeners, timers, observers, and frame requests are cleaned up on unmount.

The contact area shows a clickable email address that opens the visitor's email app with a `mailto:` link. Set `NEXT_PUBLIC_CONTACT_EMAIL` to your address locally and in Vercel, then rebuild. If no address is configured, the link is omitted. There is no form, chatbot, email delivery provider, or contact rate-limit secret to configure. The site does not receive or store visitor messages. `DATABASE_URL` is still used for project data.
