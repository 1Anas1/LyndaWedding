# Production Deployment on Vercel

This guide covers deploying the Lynda Wedding app to Vercel with PostgreSQL, Stripe, and Vercel Blob.

---

## 1. Vercel project setup

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**.
3. Import the repository and select the root directory. Framework preset: **Next.js** (auto-detected).
4. Do **not** build yet until environment variables and database are set.

---

## 2. Database (PostgreSQL)

Vercel does not run PostgreSQL. Use one of:

- **Vercel Postgres** (recommended): Project → Storage → Create Database → Postgres. Copy the connection string.
- **Neon**: [neon.tech](https://neon.tech) → create project → copy connection string.
- **Supabase / Railway / other**: Create a PostgreSQL database and copy the connection string.

Use the **connection string** (not pooler) for Prisma if you have both (e.g. Neon direct vs pooler). For serverless, a pooler URL is often better; see your provider’s docs.

---

## 3. Environment variables in Vercel

In Vercel: **Project → Settings → Environment Variables**. Add these for **Production** (and optionally Preview/Development):

| Name | Value | Notes |
|------|--------|------|
| `DATABASE_URL` | `postgresql://...` | From your Postgres provider |
| `AUTH_SECRET` | (random string) | e.g. `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL (or custom domain) |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | From [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe webhook (see step 5) |
| `BLOB_READ_WRITE_TOKEN` | (token) | From Vercel: Storage → Blob → create store → copy token |

- **AUTH_SECRET**: Must be set in production; use a long random value.
- **NEXT_PUBLIC_APP_URL**: Must match the URL guests and Stripe use (e.g. `https://your-domain.vercel.app`).
- **BLOB_READ_WRITE_TOKEN**: Required for event image uploads; create a Blob store in the same Vercel project (Storage → Blob).

---

## 4. Prisma migrations in production

Vercel runs `npm run build`, which runs `prisma generate` automatically if you have a `postinstall` that runs it (or Next.js build runs it). **Migrations are not run automatically.**

### Option A: Run migrations from your machine (recommended for first deploy)

1. Set `DATABASE_URL` in your local `.env` to the **production** database URL (same as Vercel).
2. Run:
   ```bash
   npx prisma migrate deploy
   ```
   This applies all pending migrations to the production DB. Use this for production; do **not** use `prisma migrate dev` against production.

### Option B: Run migrations in Vercel build

Add to `package.json`:

```json
"scripts": {
  "build": "prisma generate && prisma migrate deploy && next build"
}
```

Then every Vercel build will apply migrations. Only do this if you are comfortable with migrations running on every deploy.

### After first deploy

For future schema changes:

1. Locally: `npx prisma migrate dev --name your_migration_name`
2. Commit the new migration file under `prisma/migrations/`.
3. For production, either run `npx prisma migrate deploy` locally with production `DATABASE_URL`, or rely on the build script above.

---

## 5. Stripe webhook (production)

1. In [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → **Add endpoint**.
2. **Endpoint URL**: `https://your-app.vercel.app/api/billing/webhook` (replace with your real Vercel URL or custom domain).
3. **Events**: select `checkout.session.completed` and `checkout.session.async_payment_failed` (or the events your webhook handler uses).
4. Create the endpoint and copy the **Signing secret** (`whsec_...`).
5. In Vercel, set **Environment Variable** `STRIPE_WEBHOOK_SECRET` to that value and redeploy if needed.

---

## 6. Vercel Blob (event images)

1. In Vercel: **Project → Storage → Create Database** (or **Add** if you already use Postgres).
2. Choose **Blob** and create a store.
3. Copy the **BLOB_READ_WRITE_TOKEN** (or the token shown for the Blob store).
4. Add it as an environment variable in the same project (see step 3).

Event image uploads (`POST /api/upload/event-image`) will then store files in Vercel Blob and return a public URL. That URL is saved in `Event.imageUrl` and used as the venue image on the invitation page.

---

## 7. Deploy

1. Save all environment variables in Vercel.
2. Trigger a deploy: push to the linked branch or use **Redeploy** in the Vercel dashboard.
3. After deploy, run migrations if you use Option A (see step 4).

---

## 8. Post-deploy checks

- **Homepage**: `https://your-app.vercel.app`
- **Login**: `https://your-app.vercel.app/login`
- **Invitation**: `https://your-app.vercel.app/i/your-slug`
- **Stripe**: Complete a test payment and confirm the webhook runs (Stripe Dashboard → Webhooks → your endpoint → recent events).
- **Event image**: As owner, add an event with an image and confirm it appears on the invitation (venue image in “Détails du jour”).

---

## 9. Caveats

- **Serverless**: Cold starts can add latency; Prisma + connection pooling (e.g. Neon pooler) is recommended.
- **Existing event images**: Invitations that already have `Event.imageUrl` as a **relative** path (e.g. `/uploads/events/...`) were from local storage and will **not** resolve on Vercel. Re-upload the image in the event editor to store a Blob URL.
- **Build**: If you use Option B (migrate in build), ensure the build role can connect to the production database and that migrations are safe to run on every deploy.
