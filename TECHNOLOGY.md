# Technology & Architecture

This document describes the technologies, architecture, and main flows used in the Lynda Wedding invitation SaaS.

---

## Technologies

### Core

| Technology | Version / Notes |
|------------|-----------------|
| **Next.js** | 15.x, App Router |
| **React** | 18.3.x |
| **TypeScript** | 5.x |
| **Node.js** | 18+ recommended |

### Data & ORM

| Technology | Role |
|------------|------|
| **PostgreSQL** | Primary database |
| **Prisma** | ORM: schema, migrations, client (`@prisma/client` 5.x) |

### Auth

| Technology | Role |
|------------|------|
| **NextAuth** | v5 (beta), session-based auth |
| **Credentials provider** | Email + password |
| **bcryptjs** | Password hashing |

### Payments

| Technology | Role |
|------------|------|
| **Stripe** | Checkout Session (one-time payment to publish), webhook for payment confirmation |

### UI & Styling

| Technology | Role |
|------------|------|
| **Tailwind CSS** | Utility-first CSS |
| **Radix UI** | Accordion, Collapsible, Label, Radio, Tabs (shadcn-style) |
| **Framer Motion** | Animations (intro overlay, sections) |
| **Lucide React** | Icons |
| **class-variance-authority (cva)** | Component variants |
| **clsx** / **tailwind-merge** | Class names |

### Forms & Validation

| Technology | Role |
|------------|------|
| **React Hook Form** | Form state and submission |
| **Zod** | Schema validation |
| **@hookform/resolvers** | Zod resolver for RHF |

### Other

| Technology | Role |
|------------|------|
| **TanStack Query (React Query)** | Server state / caching (e.g. dashboard data) |
| **Sonner** | Toast notifications |

---

## Architecture Overview

- **Front-end:** Next.js App Router, React components, client-side state and React Query where needed.
- **Back-end:** Next.js API routes (REST-style) and server components where used.
- **Auth:** NextAuth middleware protects `/app` (OWNER) and `/admin` (ADMIN); public routes are allowlisted.
- **Data:** Prisma → PostgreSQL; no separate BFF—API routes are the backend.
- **Static assets:** Served from `public/` (e.g. `public/assets/` → `/assets/*`).

---

## Data Model (Prisma)

- **User** — id, email, name, password (hashed), role (OWNER | ADMIN).
- **Theme** — id, name, tokensJson (colors, fonts, etc.), used by Invitation.
- **Invitation** — ownerId, slug (unique), status (DRAFT | PUBLISHED), contentJson, settingsJson, themeId, eventDate, publishedAt; relations: events, rsvps, payments, views.
- **Event** — invitationId, name, startsAt, endsAt, locationName, address, mapLat, mapLng, notes, **imageUrl** (optional).
- **RSVP** — invitationId, guestName, email, phone, attending, partySize, notes, dietary, dedupeKey.
- **InvitationView** — invitationId, viewedAt, sessionId (for deduplication).
- **Payment** — invitationId, stripeSessionId, stripePaymentIntentId, amount, currency, status (PENDING | PAID | FAILED).
- **AuditLog** — actorId, action, targetType, targetId, metadataJson.

---

## Auth Flow

1. **Login:** `POST /api/auth/callback/credentials` (NextAuth) with email/password; bcrypt compare; session created with `id` and `role`.
2. **Middleware:** Runs on every request (except static/public). Allows: `/`, `/login`, `/i/*`, `/u/*`, `/wedding`, `/api/invites/*`, `/api/rsvp`, `/api/auth/*`, `/api/billing/webhook`, `/unauthorized`. For `/app/*`: requires session and `role === OWNER`. For `/admin/*`: requires session and `role === ADMIN`. For `/api/invitations/*` (except slug/publish): requires session; ownership checked in route. For `/api/billing/*`: requires session and OWNER.
3. **Helpers:** `requireOwner()`, `getInvitationForOwner()` in `lib/auth.ts` used by API routes to enforce ownership.

---

## Main Flows

### Invitation creation and editing

- Owner creates invitation (slug, theme, content). Content and design stored in `contentJson` / theme `tokensJson`. Events are CRUD via `PUT /api/invitations/[id]/events` (create/update/delete); event image upload via `POST /api/upload/event-image` (saved under `public/uploads/events/`).

### Public invitation view

- **GET** `/api/invites/[slug]`: Loads invitation (with events); returns `wedding_settings` (hero names, date, location, address, map URL, **banquet_image_url** from first event’s imageUrl), timeline, `event_details` not exposed for main wedding page; used by the wedding page client.
- **Wedding page:** Fetches `/api/invites/[slug]`, renders IntroOverlay (video + poster), Hero, Countdown, “Détails du jour” (LocationSection: venue image from `banquet_image_url`, then map), RSVP section, Footer. **POST** `/api/invites/[slug]/view` records a view (session-based).

### RSVP

- Guest submits form; **POST** `/api/rsvp` with invitation slug and guest data; RSVP stored; optional confirmation UI.

### Publish and payment

- Owner clicks “Publish”; if payment required, app creates Stripe Checkout Session (**POST** `/api/billing/checkout`); user pays; Stripe sends webhook to **POST** `/api/billing/webhook`; app marks payment PAID and invitation PUBLISHED.

### Dashboard stats and messages

- Dashboard loads invitations; view counts and message counts come from `InvitationView` and guest messages. **Stats** and **messages** pages use API that reads these plus invitation data (owner-only).

---

## API Routes Summary

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/[...nextauth]` | * | No | NextAuth handlers |
| `/api/auth/signout` | POST | No | Sign out |
| `/api/invitations` | GET, POST | Owner | List, create |
| `/api/invitations/[id]` | GET, PATCH | Owner | Get, update |
| `/api/invitations/[id]/events` | PUT | Owner | Replace events (create/update/delete) |
| `/api/invitations/[id]/publish` | POST | Owner | Publish (or start payment) |
| `/api/invitations/[id]/stats` | GET | Owner | Stats for dashboard |
| `/api/invites/[slug]` | GET | No | Public wedding data for invitation page |
| `/api/invites/[slug]/view` | POST | No | Record view (sessionId) |
| `/api/rsvp` | POST | No | Submit RSVP |
| `/api/billing/checkout` | POST | Owner | Create Stripe Checkout Session |
| `/api/billing/webhook` | POST | No (Stripe signature) | Stripe webhook |
| `/api/upload/event-image` | POST | Owner | Upload event image → Vercel Blob (public URL returned) |

---

## Front-End Structure

- **Landing:** `app/page.tsx`.
- **Wedding / invitation:** `app/wedding/page.tsx` (client); used by `app/i/[slug]/page.tsx` (server) which passes `initialSlug`; data from `GET /api/invites/[slug]`.
- **Dashboard:** `app/app/layout.tsx` (nav) + `app/app/page.tsx` (cards), `app/app/invitations/*`, `app/app/billing/page.tsx`; uses `components/app/*` (InvitationEditor, EventsTab, ContentTab, DesignTab, RSVPTab, LinksTab, PreviewTab, StatsTab, CopyInvitationLink).
- **Wedding UI:** `components/wedding/*` (IntroOverlay, HeroSection, CountdownSection, LocationSection, RSVPForm, Footer, etc.); **LocationSection** shows venue image from `banquet_image_url` (first event’s imageUrl) and map.
- **Finca template:** `app/i/[slug]/test/page.tsx` uses `components/templates/finca/FincaInvitationPage` (different layout; uses `EventList` and `MapCard` from `components/public`).

---

## Static Assets

- All served from **`public/`**. The app references `/assets/...` (e.g. `/assets/Video_Edit.mp4`, `/assets/intro1.png`); files must live in `public/assets/`. Do not put assets in a root-level `assets/` folder—that is not served by Next.js.

---

## Security Notes

- Passwords hashed with bcrypt.
- NextAuth `AUTH_SECRET` required in production.
- Stripe webhook verified with `STRIPE_WEBHOOK_SECRET`.
- Owner/Admin enforced in middleware and in API route helpers (`requireOwner`, role checks).
- Upload (event image) restricted to owner; files stored in Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set.

---

## Performance

- Next.js 15 with Turbopack for dev.
- Prisma: use indexes (e.g. invitationId, slug, status) and avoid N+1 (include relations as needed).
- Public invitation page: one fetch to `/api/invites/[slug]` then client render; consider ISR or static generation for published slugs if needed later.
