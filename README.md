# Lynda Wedding — Digital Wedding Invitations SaaS

A **SaaS platform** that lets couples create and manage modern digital wedding invitation sites: custom content, events with maps and photos, RSVP collection, guest messages, and free publishing. Guests view a single-page wedding experience with intro video, countdown, location, and RSVP.

---

## What This Project Does

- **Couples (owners)** sign in, create one or more invitations, edit content and design, add events (with location search and image upload), configure RSVP, and publish for free. They get a shareable link and a dashboard with view counts, messages, and RSVP list.
- **Guests** open the invitation link (`/i/[slug]`), see the wedding page (intro video, hero, countdown, “Détails du jour” with venue photo and map, RSVP). They can submit RSVP and leave a message.
- **Admin** (optional) can access an admin area for internal use.

---

## Features

| Area | Features |
|------|----------|
| **Auth** | Email/password (NextAuth), session, roles: OWNER, ADMIN |
| **Invitations** | Create, edit, draft/publish, slug, content JSON, theme, settings JSON |
| **Content** | Hero (names, date, message), design tab, theme tokens |
| **Events** | Multiple events per invitation; name, dates, location, address, map (lat/lng), notes, **uploaded image**; location search (Nominatim), map preview |
| **RSVP** | Form per invitation, guest name, email, phone, attending, party size, notes, dietary; stored in DB |
| **Guest messages** | “Écrivez un mot” section; messages stored and visible in dashboard |
| **Stats** | View count per invitation (session-based), message list in dashboard |
| **Publish** | Free; publish anytime from the editor or the Publish page |
| **Public page** | Intro overlay (video + poster), hero, countdown, “Détails du jour” (venue photo + map), RSVP, footer; background music |
| **Sharing** | Copy invitation link (`/i/[slug]`), optional user link `/u/[userId]` |

---

## Tech Stack (Summary)

- **Runtime:** Next.js 15 (App Router), React 18, TypeScript  
- **Styling:** Tailwind CSS, Radix UI (shadcn-style), Framer Motion  
- **Data:** PostgreSQL, Prisma ORM  
- **Auth:** NextAuth v5 (Credentials provider, bcrypt)  
- **Payments:** Stripe (Checkout Session, webhook)  
- **Forms:** React Hook Form, Zod  

See **[TECHNOLOGY.md](./TECHNOLOGY.md)** for details.

---

## Quick Start

**Prerequisites:** Node.js 18+, npm (or pnpm), PostgreSQL (local, Docker, or cloud).

```bash
# Install dependencies
npm install

# Copy env and set DATABASE_URL (and optionally AUTH_SECRET, Stripe keys)
cp .env.example .env

# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# Seed demo data (optional)
npm run db:seed

# Start dev server
npm run dev
```

- **Homepage:** http://localhost:3000  
- **Demo invitation:** http://localhost:3000/i/demo-wedding (or `?preview=1` for draft)  
- **Login:** http://localhost:3000/login  
- **Dashboard (after login):** http://localhost:3000/app  

See **[SETUP.md](./SETUP.md)**, **[ENV_SETUP.md](./ENV_SETUP.md)**, and **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for full setup and troubleshooting.

---

## Available Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server (with Turbo) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database (tsx prisma/seed.ts) |
| `npm run db:studio` | Open Prisma Studio |

---

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   ├── globals.css           # Global styles
│   ├── wedding/              # Wedding page (used by /i/[slug])
│   ├── app/                  # Owner dashboard (protected)
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard home
│   │   ├── billing/
│   │   └── invitations/      # List, new, [id]/edit, [id]/messages, [id]/stats
│   ├── i/[slug]/             # Public invitation: page, rsvp, test (Finca)
│   ├── u/[userId]/           # User-facing link (redirect to invitation)
│   ├── login/
│   ├── unauthorized/
│   ├── admin/                # Admin area (protected)
│   └── api/
│       ├── auth/             # NextAuth [...nextauth], signout
│       ├── billing/           # checkout, webhook (Stripe)
│       ├── invitations/       # CRUD, [id]/events, publish, stats
│       ├── invites/[slug]/    # Public GET (wedding data), view (POST view count)
│       ├── rsvp/              # RSVP submit
│       └── upload/event-image # Event image upload (owner)
├── components/
│   ├── wedding/              # IntroOverlay, HeroSection, Countdown, LocationSection, RSVPForm, Footer, etc.
│   ├── app/                  # Dashboard: InvitationEditor, tabs (Events, Content, Design, RSVP, Links, Preview, Stats), CopyInvitationLink
│   ├── public/               # EventList, MapCard, RSVPCTA, Hero (Finca), etc.
│   ├── templates/finca/      # FincaInvitationPage (used by /i/[slug]/test)
│   └── ui/                   # Button, Tabs, etc. (shadcn-style)
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── auth.ts               # requireOwner, getInvitationForOwner, etc.
│   └── utils.ts
├── prisma/
│   ├── schema.prisma         # User, Theme, Invitation, Event, RSVP, Payment, InvitationView, AuditLog
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── assets/               # Static assets (images, video, audio) served at /assets/*
├── auth.ts                   # NextAuth config (Credentials, callbacks)
├── middleware.ts             # Auth & role-based route protection
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Main Routes

| Path | Who | Description |
|------|-----|-------------|
| `/` | Public | Landing page |
| `/wedding` | Public | Wedding page (also used as main invitation view) |
| `/i/[slug]` | Public | Invitation page (published or preview) |
| `/i/[slug]/rsvp` | Public | RSVP form |
| `/i/[slug]/test` | Public | Finca-style test invitation |
| `/u/[userId]` | Public | Redirect to that user’s invitation |
| `/login` | Public | Sign in |
| `/app` | Owner | Dashboard home |
| `/app/invitations` | Owner | Invitation list, new, edit, messages, stats |
| `/app/billing` | Owner | Billing / payment |
| `/admin` | Admin | Admin area |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | NextAuth secret (e.g. `openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | Recommended | App URL (e.g. `http://localhost:3000` or `https://your-app.vercel.app`) |
| `BLOB_READ_WRITE_TOKEN` | For event image uploads | Vercel Blob token (required for upload; get from Vercel project → Storage → Blob) |

See **[ENV_SETUP.md](./ENV_SETUP.md)** for details, **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for database options, and **[DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)** for production deployment on Vercel.

---

## Documentation

- **[SETUP.md](./SETUP.md)** — Setup checklist and verification  
- **[ENV_SETUP.md](./ENV_SETUP.md)** — Environment variables  
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** — PostgreSQL (Docker, local, cloud)  
- **[DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)** — Production deployment on Vercel  
- **[TECHNOLOGY.md](./TECHNOLOGY.md)** — Technologies and architecture

---

## License

Private project.
