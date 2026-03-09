# Technology Stack & Implementation Details

This document describes the technologies, dependencies, database schema, and configuration used in the Lynda Wedding SaaS.

---

## Core Stack

| Category | Technology | Version / notes |
|----------|------------|------------------|
| **Runtime** | Node.js | 18+ |
| **Framework** | Next.js | 15 (App Router) |
| **UI** | React | 18.3 |
| **Language** | TypeScript | 5.x |
| **Database** | PostgreSQL | Any 14+ compatible |
| **ORM** | Prisma | 5.x |
| **Auth** | NextAuth.js | 5 (beta, Credentials provider) |
| **Payments** | Stripe | 17.x |
| **Styling** | Tailwind CSS | 3.x |
| **Components** | Radix UI | Accordion, Tabs, Label, etc. |
| **Animation** | Framer Motion | 11.x |
| **Forms** | React Hook Form + Zod | 7.x / 3.x |
| **Data fetching** | TanStack Query | 5.x (where used) |
| **Icons** | Lucide React | 0.454.x |
| **Password hashing** | bcryptjs | 2.4.x |
| **Notifications** | Sonner | 2.x |

---

## Key Dependencies (package.json)

### Production

- **next** — App Router, API routes, server components
- **react**, **react-dom** — UI
- **@prisma/client** — Database access
- **next-auth** — Session and credentials auth
- **stripe** — Checkout and webhooks
- **tailwind-merge**, **class-variance-authority**, **clsx** — Styling utilities
- **framer-motion** — Intro overlay and section animations
- **@radix-ui/*** — Accessible primitives (tabs, accordion, etc.)
- **react-hook-form**, **@hookform/resolvers**, **zod** — Form validation
- **@tanstack/react-query** — Server state and caching
- **lucide-react** — Icons
- **bcryptjs** — Password hashing
- **sonner** — Toasts

### Dev

- **prisma** — Migrations and generate
- **typescript**, **@types/*** — Types
- **eslint**, **eslint-config-next** — Linting
- **tailwindcss**, **autoprefixer**, **postcss** — CSS
- **tsx** — Running seed script

---

## Database (Prisma)

### Schema overview

- **User** — id, email, name, password (nullable), role (OWNER | ADMIN). Relations: invitations, auditLogs.
- **Theme** — id, name, tokensJson (colors, fonts), isActive. Used by Invitation.
- **Invitation** — id, ownerId, slug (unique), status (DRAFT | PUBLISHED), title, locale, eventDate, themeId, contentJson, settingsJson, publishedAt. Relations: owner, theme, events, rsvps, payments, views.
- **Event** — id, invitationId, name, startsAt, endsAt, locationName, address, mapLat, mapLng, notes, imageUrl. One invitation has many events.
- **RSVP** — id, invitationId, guestName, email, phone, attending, partySize, notes, dietary, dedupeKey. One invitation has many RSVPs.
- **InvitationView** — id, invitationId, viewedAt, sessionId. For view-count and deduplication.
- **Payment** — id, invitationId, stripeSessionId, stripePaymentIntentId, amount (cents), currency, status (PENDING | PAID | FAILED).
- **AuditLog** — id, actorId, action, targetType, targetId, metadataJson. Optional auditing.

### Migrations

Migrations live under `prisma/migrations/`. After changing `schema.prisma`, run:

```bash
npm run db:migrate
npm run db:generate
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL URL, e.g. `postgresql://user:pass@host:5432/dbname?schema=public` |
| `AUTH_SECRET` | Yes (production) | NextAuth secret; e.g. `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | No | Base URL of the app (e.g. `https://yourdomain.com`) |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key (e.g. `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | For payments | Webhook signing secret (e.g. `whsec_...`) |

- `.env` is not committed; use `.env.example` as a template.
- For local Stripe webhooks: `stripe listen --forward-to localhost:3000/api/billing/webhook`.

---

## Static Assets

- All public assets are under **`public/`**. The app references them by path (e.g. `/assets/...`).
- **`public/assets/`** contains: intro video, poster, music, illustrations, images used by the wedding page and templates. Do not put source assets in a root `assets/` folder; only `public/` is served.

---

## Build & Run

- **Dev:** `npm run dev` (Next.js with Turbopack).
- **Build:** `npm run build`.
- **Start:** `npm run start`.
- **Lint:** `npm run lint`.

---

## Conventions

- **API routes:** Under `app/api/`. Use `NextRequest` / `NextResponse`, validate with Zod where applicable.
- **Auth:** `auth.ts` exports `auth`, `signIn`, `signOut`, `handlers`. Middleware protects `/app/*` and `/admin/*`; public routes include `/`, `/i/*`, `/u/*`, `/wedding`, `/login`.
- **Database:** Single `db` instance from `@/lib/db` (PrismaClient). No direct SQL; use Prisma only.
