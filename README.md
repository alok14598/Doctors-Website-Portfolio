# Meridian Family Clinic — Doctors Clinic Website

A full-stack website for a doctors' clinic: who practises there, what the clinic treats,
what equipment and amenities are on site, and an online **appointment request** flow that
lands in a staff-only inbox.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · PostgreSQL 17 + Prisma 7 ·
Auth.js v5 · zod · Vitest + Playwright.

> **The clinic in this repository is invented.** "Meridian Family Clinic", its six doctors,
> their registration numbers and every testimonial are placeholder content, confined to
> `prisma/seed.ts`. No doctor photographs are seeded — the UI falls back to initials, because
> a stock portrait beside a real doctor's name misleads patients. See
> [Replacing the placeholder content](#replacing-the-placeholder-content).

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
#    Generate the session key:   openssl rand -base64 48   → AUTH_SECRET
#    Set SEED_ADMIN_PASSWORD (12+ chars, with upper, lower and a digit)

# 3. Start PostgreSQL (creates clinic_db, clinic_db_test and clinic_db_e2e)
docker compose up -d

# 4. Create the schema and load the clinic content
npm run db:migrate
npm run db:seed

# 5. Run it
npm run dev
```

| Where         | URL                               |
| ------------- | --------------------------------- |
| Website       | http://localhost:3000             |
| Staff sign in | http://localhost:3000/admin/login |
| Health check  | http://localhost:3000/api/health  |

Sign in with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from your `.env`.

> Postgres is published on host port **5433**, not 5432, so it does not fight a Postgres you
> may already be running locally.

---

## Pages

| Route                                                                         | What it is for                                                                          |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/`                                                                           | Tagline, service highlights, featured doctors, facilities, hours, testimonials          |
| `/about`                                                                      | The clinic's story, specialties on site, accreditations, and what it is _not_           |
| `/services`                                                                   | Every service, grouped by category                                                      |
| `/services/[slug]`                                                            | One service: what it involves, how to prepare, who performs it                          |
| `/doctors`                                                                    | Doctor directory, filterable by specialty                                               |
| `/doctors/[slug]`                                                             | Profile: qualifications, registration number, consulting days, languages                |
| `/facilities`                                                                 | **What is available in the clinic** — diagnostics, treatment rooms, pharmacy, amenities |
| `/patient-info`                                                               | First-visit walkthrough and FAQs                                                        |
| `/contact`                                                                    | Address, phone, email, hours, directions                                                |
| `/appointment`                                                                | The patient-facing request form                                                         |
| `/admin/login` · `/admin/appointments` · `/admin/doctors` · `/admin/services` | Staff area                                                                              |

---

## Architecture

```
Doctors Website/
├── prisma/            schema, migrations, seed (all placeholder content lives here)
├── e2e/               Playwright specs
└── src/
    ├── app/
    │   ├── (site)/    public pages — its layout loads the clinic profile once
    │   ├── admin/     login + (dashboard)/ behind a verified session
    │   └── api/       health probe and the Auth.js handler
    ├── components/    ui/ primitives · layout/ shell · sections/ page blocks · admin/
    ├── lib/           zod schemas, formatters, SEO helpers, rate limiter, auth config
    └── server/
        ├── repositories/  Prisma queries only
        ├── services/      business rules, throw AppError
        └── actions/       'use server' — guard, validate, call a service, revalidate
```

### The layering rule

```
Server Component / Server Action  →  service  →  repository  →  Prisma
```

| Layer             | May do                                                          | May never do                     |
| ----------------- | --------------------------------------------------------------- | -------------------------------- |
| page / component  | read validated input, render                                    | touch Prisma or a repository     |
| `*.actions.ts`    | check the session, validate, call one service, `revalidatePath` | contain business rules           |
| `*.service.ts`    | business rules, throw `AppError`                                | know about requests or responses |
| `*.repository.ts` | Prisma queries                                                  | throw HTTP or user-facing errors |

A page that needs a join goes through a service (see `getServiceIdsByDoctor`), it does not
reach for `prisma` — that is what keeps the rule true rather than aspirational.

### One schema, both sides of the wire

Every form payload is defined once in `src/lib/schemas/` as a zod schema. The client form
validates with it through `@hookform/resolvers`, and the Server Action re-validates the
same payload with the same schema. A rule change becomes a **type error** on whichever side
has not caught up, rather than a runtime surprise.

The form schemas are deliberately **idempotent** — `doctorFormSchema.parse(output)` equals
`output` — which is what makes validating the same payload twice safe. `src/lib/schemas/schemas.test.ts`
asserts this, because it is easy to break by adding a transform.

### Server Actions, not a REST API

Reads happen directly in Server Components; writes go through Server Actions. In a single
Next.js app, hand-rolling `/api/*` routes only to `fetch` them from your own components adds
a serialisation hop and loses end-to-end types. Actions return a typed `ActionResult` rather
than throwing: a thrown error reaches the browser as an opaque digest, and a patient needs to
be told what to fix.

`/api/health` remains a route handler, because an uptime monitor needs a plain URL.

---

## Appointment requests, not bookings

The form creates a **request**, never a confirmed slot. There is deliberately no availability
model and no slot locking:

1. The patient submits; the action rate-limits, validates, and stores the row as `NEW`.
2. The confirmation panel says in as many words that this is _not_ a booking yet.
3. Reception calls back and advances the row: `NEW → CONTACTED → CONFIRMED → COMPLETED`.

`CANCELLED` is terminal. Reopening a cancelled request would hide from staff that it was ever
cancelled, so the service refuses it and staff ask the patient to submit again.

A second request from the same phone number within two hours is rejected as a double
submission — otherwise staff reconcile two rows for one patient by hand.

---

## Patient data

The `reason` field is patient-supplied health information. This is not a HIPAA- or
DISHA-scoped system, but the handling is explicit rather than assumed:

- **Never logged.** No request logger prints bodies, and no `console.log` touches it.
- **Never in a URL.** It travels in a Server Action POST body, not a query string, so it
  cannot end up in access logs, browser history or a `Referer` header.
- **Never echoed into an error.** Validation errors use the schema's own wording;
  `toUserMessage` replaces any unexpected error with a fixed string, because a raw Prisma
  error can carry a connection string or row contents.
  `appointment.service.test.ts` asserts this directly.
- **Not indexable.** Every `/admin` route sets `noindex, nofollow, nocache`, and
  `robots.txt` disallows `/admin`.

### Authentication

Credentials auth with an 8-hour JWT session cookie. There is **no self-service signup** —
accounts come from the seed, so there is no registration surface to attack.

- Passwords are bcrypt hashes at cost 12.
- `authorize` compares against a dummy hash when the email is unknown, so a missing account
  and a wrong password take the same time and cannot be told apart.
- The sign-in failure message never says which half was wrong.

### Two layers of access control

`middleware.ts` only checks that a session **cookie is present** — verifying the JWT needs the
Node runtime, which middleware does not have. It is the fast redirect for signed-out visitors,
**not** the access control.

The real checks are:

- `src/app/admin/(dashboard)/layout.tsx` calls `auth()` and redirects if there is no session.
- Every admin Server Action calls `requireStaff()` for itself. A Server Action is a POST
  endpoint of its own — it cannot trust that the caller came from a guarded page.

### Rate limiting

`src/lib/rateLimit.ts` is a fixed-window counter held in **process memory**: five appointment
requests per IP per fifteen minutes. Being honest about its limits:

- It does not survive a restart.
- It is **not shared between instances.** Deploying behind more than one Node process means
  moving the counter to Redis or an equivalent.
- `x-forwarded-for` is spoofable, so this raises the cost of abuse rather than preventing it.
  The phone-number duplicate check in the service layer is the backstop that actually protects
  the staff inbox.

---

## Design

Healthcare-template idiom — navy headings over a mid corporate blue, taken from a supplied
reference. Tokens live in `src/app/globals.css`:

- **Blue is load-bearing.** `#1668d6` for actions, icons and the accented half of a heading;
  navy `#0f2a47` for headings; a blue-tinted `#eef4fd` wash for alternating sections rather
  than neutral grey. The blue is what makes the site read as a clinic and not a tech product.
- **Plus Jakarta Sans throughout**, bold and only lightly tracked. A harder-tracked grotesk
  reads as a tech product; this family wants a friendlier, more upright setting.
- **Two-tone headings.** `SectionHeading` and `PageHeader` take `title` plus an optional
  `titleAccent`, and the clinic's hero headline is stored the same way (`heroTitle` /
  `heroTitleAccent`). Splitting the string keeps the colour out of the content and out of
  the database.
- **Pill badges above headings**, generous rounding (18px cards, 28px panels, pill buttons),
  round blue icon chips fronting every service, facility and feature.
- **Depth from soft shadow**, not drawn rules. The hero's stat cards overlap the panel's lower
  edge — that overlap is what gives the section its depth, and it needs `relative z-10` or the
  cards slide under the panel's stacking context.
- **Motion is restrained.** Sections ease up as they enter the viewport using a CSS
  `animation-timeline: view()` scroll timeline — no JavaScript, no layout shift, and browsers
  without support get the finished state, so content is never hidden behind a script that might
  not run. Buttons scale slightly on press. That is the whole motion budget.

Light-only is a decision, not an omission: a clinic site is read in daylight on a phone in a
waiting room, and a dark variant would double the contrast surface for no real benefit.

### Icons

`src/components/ui/Icon.tsx` holds about fifteen 24×24 stroked glyphs, drawn in the repo rather
than pulled from a package — the site needs a dozen, and an icon library ships thousands plus a
tree-shaking config. All are decorative (`aria-hidden`); the label beside each carries the
meaning.

Glyphs are chosen by **slug with a category fallback** (`serviceIcon`, `ICON_BY_SLUG` in
`SpecialtyTiles`). That matters twice over: adding a service in the admin never leaves a blank
chip, and inside a category-grouped list the cards do not all carry the same glyph, which would
be decoration rather than information.

### Imagery

The reference is photography-led. This build has **no photographs** and substitutes no stock
ones — an invented face beside a real clinic's name misleads patients.

- The hero takes an optional `heroImageUrl`. With a photo it matches the reference; without one
  it renders a blue gradient wash with an oversized watermark glyph, which reads as finished
  rather than as a missing asset. The legibility scrim is applied **only** over a photo, since
  on the gradient it would wash the panel out to near-white.
- Doctors fall back to initials in a blue chip when `photoUrl` is empty.

Drop real files into `public/` and set the two fields to close the gap.

### Component gotchas

Two things that have already bitten once, and will again:

- **`Button`'s base class sets `inline-flex`**, so `hidden sm:inline-flex` _on the button_ loses
  the display battle and the button leaks onto mobile. Put responsive visibility on a wrapper —
  `Header.tsx` does, with a comment.
- **The `secondary` variant carries a hairline border** because its fill can match the section
  behind it; without the border it disappears on a muted section.

### Accessibility

Targeting WCAG 2.2 AA:

- Every input goes through `components/ui/Field.tsx`, which wires a **visible** label by id and
  announces the hint and error through `aria-describedby` with `aria-invalid` set — so a failure
  is heard, not only seen as a red border.
- One `<h1>` per page, asserted for all eight public pages in `e2e/public-site.spec.ts`.
- Focus rings are defined once in `globals.css` and never removed.
- `prefers-reduced-motion: reduce` removes animation and smooth scrolling entirely.
- A skip link is the first focusable element in the root layout.
- Ratings, star rows and decorative markers carry text alternatives or `aria-hidden`.
- Sign-out is a form POST, never a link — a prefetch or an image tag must not be able to sign
  staff out.

### SEO

A clinic lives on local search, so this is in scope rather than an afterthought: per-route
`metadata` and `generateMetadata` with canonical URLs, `sitemap.xml`, `robots.txt`, and JSON-LD
from `src/lib/seo.ts` — `MedicalClinic` with address and `openingHoursSpecification` on `/` and
`/contact`, `Physician` on each doctor page, `FAQPage` on `/patient-info`.

---

## Testing

180 unit/integration tests and 25 end-to-end tests.

```bash
npm test                 # Vitest: both projects
npm run test:coverage    # with thresholds (80% lines/statements/functions, 70% branches)
npm run db:e2e:reset     # truncate + reseed the E2E database
npm run test:e2e         # Playwright
```

**Two Vitest projects**, because the two kinds of test need different worlds:

- `server` runs in Node against the real `clinic_db_test` Postgres, truncating every table
  before each test. Service tests that mocked Prisma would only prove the mock works —
  these catch real constraints, cascades and the `@db.Date` timezone trap.
- `web` runs in jsdom for components and pure functions.

**Coverage is scoped** to `lib/`, `server/services/`, `server/repositories/` and the
presentational components — the layers unit tests can meaningfully cover. Server Components,
route files, Server Actions and the Auth.js wiring are excluded and covered end to end by
Playwright instead; counting them in the Vitest threshold would only invite tests that render
a page and assert nothing. Current: **92% statements, 95% lines, 86% branches.**

**Playwright drives a production build** on port 3100 against its own database
(`clinic_db_e2e`), so an E2E test that creates and cancels appointments never touches the data
you are looking at in `npm run dev`. Next 16 also refuses a second dev server in one directory,
and asserting against a real build is what we want anyway.

Specs that mutate data restore it, so the suite is repeatable without a reset between runs.
`db:e2e:reset` (`scripts/reset-db.ts`) truncates every table and reseeds — note that
`migrate deploy` + seed is **not** a reset, because the seed upserts on natural keys and a row
a test renamed would survive as an orphan. The script refuses to run against a URL that is not
a `_test` or `_e2e` database.

---

## Deployment (Vercel)

Hosted on Vercel with a managed Postgres. `vercel.json` pins the build:

```jsonc
"buildCommand": "prisma migrate deploy && next build"
```

Migrations run **before** the build because the build reads the database — `/`, `/about`,
`/contact`, `/services`, `/facilities` and `/patient-info` are statically generated, and the two
detail routes use `generateStaticParams`.

### The ordering that matters

The first deploy fails against an empty database: prerendering `/` calls `getClinicProfile()`,
which throws when the clinic row is missing. **Migrate and seed before the first deploy**, from
your machine:

```bash
cp .env .env.production.local     # DATABASE_URL = the pooled production URL,
                                  # plus a new strong SEED_ADMIN_PASSWORD
npx dotenv -e .env.production.local -- npx prisma migrate deploy
npx dotenv -e .env.production.local -- npx tsx prisma/seed.ts

# Then rehearse the real build locally, where the logs are better:
npx dotenv -e .env.production.local -- npx next build
```

`.env.production.local` is covered by the existing `.env*` ignore rule.

### Environment variables — Production scope only

| Variable               | Notes                                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | Must be the **pooled** URL (host contains `-pooler`). Serverless opens a connection per instance; the direct URL exhausts them once several are warm. |
| `AUTH_SECRET`          | `openssl rand -base64 48`. Generate a fresh one — never reuse the local dev value.                                                                    |
| `NEXT_PUBLIC_SITE_URL` | The production origin. Drives canonical URLs, `sitemap.xml` and JSON-LD.                                                                              |

`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` are deliberately **not** set on the host. Seeding runs
from a laptop, so the staff password never sits in the hosting platform.

Scope these to Production, **not Preview**. A preview deployment inheriting `DATABASE_URL` would
run `prisma migrate deploy` against the live database on every pull request. With no Preview
variables the preview build fails fast, which is the safe outcome; give previews their own
database branch if you want them working.

### Other deployment notes

- **`postinstall: prisma generate` is load-bearing.** The Prisma client is generated into
  `node_modules`, which the host caches between builds — without the hook a deploy ships a client
  that is stale against the current schema.
- **Node 22.x**, matching `engines`.
- `/api/health` reports the database separately from the process, plus the commit and environment,
  so "is this actually the build I deployed?" has an answer.
- `trustHost: true` is already set in `src/lib/auth.ts` (required behind a platform proxy), and
  `middleware.ts` checks both the plain and `__Secure-` cookie names.
- No `images.remotePatterns` config is needed: `localImagePath` restricts images to `/public`.

### Rate limiting degrades on serverless

`src/lib/rateLimit.ts` is a counter in process memory. Each serverless instance has its own, and
instances are recycled constantly, so on a platform like Vercel it limits **far** less than it does
on a single long-lived server — treat it as best-effort only.

The protection that still holds is the database-side duplicate guard in
`appointment.service.ts`: a second request from the same phone number within two hours is rejected
regardless of which instance handles it. That is what actually keeps the staff inbox clean.
Upstash Redis via the Vercel Marketplace is the upgrade if the form is ever abused.

### Before going public

- Rotate `AUTH_SECRET` and set a new `SEED_ADMIN_PASSWORD` — not the local dev one.
- Remove the "demonstration site with placeholder content" notices once real content is in
  (see below, steps 5–7).
- Verify on the live domain that `/admin` is `noindex` and `robots.txt` disallows it.

---

## Replacing the placeholder content

Everything invented lives in **`prisma/seed.ts`**. To put a real clinic in:

1. Edit the `clinic`, `openingHours`, `specialties`, `services`, `doctors`, `facilities`,
   `testimonials` and `faqs` constants in that file.
2. Drop real photographs into `public/` and set the paths: each doctor's `photoUrl`
   (e.g. `/doctors/ananya-rao.jpg`, left `null` to keep the initials fallback) and the clinic's
   `heroImageUrl` (e.g. `/clinic/reception.jpg`) for the hero panel.
3. Set `heroTitle` and `heroTitleAccent` — the hero headline is split so the second half renders
   in the accent colour. Both fall back to `tagline` when unset.
4. Set `mapEmbedUrl` on the clinic profile to a Google Maps embed URL; `/contact` falls back to
   an "Open in Maps" link when it is blank.
5. Re-run `npm run db:seed` — every write is an upsert keyed on a natural unique field, so it
   updates in place rather than duplicating.
6. Update the hard-coded strings in `src/app/layout.tsx` (default title) and the
   `pageMetadata` descriptions, and remove the "demonstration site" notices in
   `src/app/(site)/page.tsx` and `src/components/layout/Footer.tsx`.
7. Set `NEXT_PUBLIC_SITE_URL` to the real origin so canonical URLs, the sitemap and JSON-LD
   point at the right place.

Day-to-day content — doctors and services — is editable in the staff area without a code
change. Facilities, FAQs, testimonials and opening hours are seed-managed; adding admin
screens for them is the obvious next step.

---

## Scripts

| Script                                          | What it does                      |
| ----------------------------------------------- | --------------------------------- |
| `npm run dev`                                   | Dev server on :3000               |
| `npm run build` / `start`                       | Production build and serve        |
| `npm run typecheck`                             | `tsc --noEmit`                    |
| `npm run lint` / `lint:fix`                     | ESLint                            |
| `npm run format` / `format:check`               | Prettier                          |
| `npm test` / `test:watch` / `test:coverage`     | Vitest                            |
| `npm run test:e2e` / `test:e2e:ui`              | Playwright                        |
| `npm run db:migrate` / `db:deploy` / `db:reset` | Prisma migrations                 |
| `npm run db:seed` / `db:studio`                 | Seed, and the Prisma data browser |
| `npm run db:e2e:reset`                          | Migrate and seed the E2E database |

## Known limitations

- **Rate limiting is per-process**, and degrades further on serverless — see _Deployment_.
  The database-side duplicate guard is what actually protects the staff inbox; Upstash Redis is
  the upgrade if the form is ever abused.
- **The duplicate-request guard compares phone numbers by digits**, so differently spaced forms
  of one number are caught. It does not attempt country-code normalisation: `09845000000` and
  `+919845000000` are still treated as different patients.
- **No email or SMS.** Staff see requests in the inbox; nothing is sent to the patient
  automatically. Wiring a transactional provider into `requestAppointment` is the next step.
- **No image uploads.** Doctor photos are referenced by path and placed in `public/` by hand.
- **One staff role in practice.** The schema has `OWNER` and `STAFF`, but no screen yet
  distinguishes them.
- **Preview deployments have no database** by design, so preview builds fail fast rather than
  migrating production. Wire up a database branch to enable them.
