# Architecture — Routes, Auth, API & Flows

This document describes how the Lynda Wedding app is structured: routes, authentication, API, and main user flows.

---

## Routes Overview

### Public (no auth)

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/wedding` | Wedding page (intro video, hero, countdown, location, RSVP). Data loaded by slug from URL or session. |
| `/i/[slug]` | Invitation page: loads invitation by slug, then renders `WeddingPage` with that slug. Access if published or preview. |
| `/i/[slug]/rsvp` | RSVP form for that invitation |
| `/i/[slug]/test` | Finca-style test template (mock or DB data) |
| `/u/[userId]` | Redirect or show invitation for that user |
| `/login` | Login page (credentials) |
| `/unauthorized` | Shown when access is denied |

### Protected (auth required)

| Path | Description |
|------|-------------|
| `/app` | Dashboard: list invitations, copy link, stats, messages, edit, billing entry |
| `/app/billing` | Billing (Stripe) |
| `/app/invitations/new` | Create new invitation |
| `/app/invitations/[id]/edit` | Edit invitation (content, design, events, RSVP, links, preview) |
| `/app/invitations/[id]/messages` | View count and guest messages |
| `/app/invitations/[id]/stats` | Stats per invitation |
| `/admin` | Admin dashboard |

---

## Authentication

- **Provider:** NextAuth v5 with **Credentials** (email + password). Config in **`auth.ts`**.
- **Session:** JWT. Callbacks add `user.id` and `user.role` (OWNER | ADMIN) to the session.
- **Middleware:** **`middleware.ts`** runs on every request:
  - Protects `/app/*` and `/admin/*` (redirect to `/login` if unauthenticated).
  - Allows `/`, `/i/*`, `/u/*`, `/wedding`, `/login`, `/unauthorized`, and API routes used by the public (e.g. `/api/invites/*`, `/api/rsvp`).
- **Helpers:** `requireOwner()` (and similar) in `lib/auth.ts` used in API routes to ensure the user is the owner of the resource.

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| **Auth** | | |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers |
| POST | `/api/auth/signout` | Sign out |
| **Invitations (owner)** | | |
| GET | `/api/invitations` | List invitations for current user |
| POST | `/api/invitations` | Create invitation |
| GET | `/api/invitations/[id]` | Get one (owner only) |
| PUT | `/api/invitations/[id]` | Update (owner only) |
| GET | `/api/invitations/[id]/events` | List events (owner only) |
| PUT | `/api/invitations/[id]/events` | Create/update/delete events (owner only), includes `imageUrl` |
| POST | `/api/invitations/[id]/publish` | Publish (and Stripe checkout if configured) |
| GET | `/api/invitations/[id]/stats` | Stats (owner only) |
| **Public invitation data** | | |
| GET | `/api/invites/[slug]` | Public invitation payload (wedding_settings, timeline, event_details for location/photo, etc.) |
| POST | `/api/invites/[slug]/view` | Record one view (session-based deduplication) |
| **RSVP** | | |
| POST | `/api/rsvp` | Submit RSVP (public) |
| **Billing** | | |
| POST | `/api/billing/checkout` | Create Stripe Checkout Session (owner) |
| POST | `/api/billing/webhook` | Stripe webhook (publish on success) |
| **Upload** | | |
| POST | `/api/upload/event-image` | Upload event image (owner only), saved under `public/uploads/events/` |

---

## Main Components

### Wedding (public invitation)

- **`app/wedding/page.tsx`** — Client component; fetches `/api/invites/[slug]`, renders:
  - `IntroOverlay` (video + poster, click to play, fade out at end)
  - `HeroSection`, `CountdownSection`
  - `LocationSection` (location, address, times, **venue image** from first event’s `imageUrl`, map iframe)
  - `RSVPForm`, `Footer`
- **`components/wedding/`** — IntroOverlay, HeroSection, CountdownSection, LocationSection, RSVPForm, Footer, SectionDivider, MuteButton, etc.

### Dashboard

- **`app/app/layout.tsx`** — Dashboard layout and nav.
- **`app/app/page.tsx`** — Dashboard home: invitation cards, copy link, stats, messages, edit.
- **`components/app/InvitationEditor`** — Tabs: Design, Content, Events, RSVP, Links, Preview.
- **`components/app/tabs/`** — EventsTab (events + image upload + map search), ContentTab, DesignTab, RSVPTab, LinksTab, PreviewTab, StatsTab.
- **`components/public/EventList`**, **MapCard** — Used in preview and (if re-enabled) on invitation.

### Finca template

- **`components/templates/finca/`** — FincaInvitationPage, IntroOverlay, IntroMusic. Used on `/i/[slug]/test`.

---

## Main User Flows

1. **Owner: create and publish**
   - Login → Dashboard → New invitation → Edit (content, design, events with optional image and map) → Save events → Publish (Stripe checkout if enabled) → Copy invitation link.

2. **Guest: view and RSVP**
   - Open `/i/[slug]` → Intro overlay (video) → Wedding page (hero, countdown, location with photo and map) → RSVP or “Écrivez un mot” → Submit.

3. **Owner: see stats**
   - Dashboard → “Stats & messages” (or similar) → View count and list of guest messages.

4. **Event image**
   - Events tab: add event → optional “Choisir une image” upload → address/map via “Rechercher un lieu” (Nominatim) → Save. First event’s image is shown in “Détails du jour” on the invitation.

---

## Data Flow (invitation page)

1. **`/i/[slug]`** (server): Load invitation from DB; check published or preview; render `<WeddingPage initialSlug={slug} />`.
2. **WeddingPage** (client): `useInviteData(initialSlug)` fetches `GET /api/invites/[slug]`.
3. **`/api/invites/[slug]`**: Loads invitation with events; returns `wedding_settings` (including `banquet_image_url` from first event’s `imageUrl`), timeline, etc.
4. **LocationSection** receives `venueImageUrl={ws.banquet_image_url}` and shows it in the “Détails du jour” block above the map.

---

## File Uploads

- **Event images:** POST to `/api/upload/event-image` (owner only); file saved under `public/uploads/events/`; response returns `{ url }` (e.g. `/uploads/events/...`). Stored in `Event.imageUrl` and shown in dashboard preview and on the invitation in the location section.
