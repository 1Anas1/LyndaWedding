# Environment Variables Setup Guide

## Current Status

✅ `.env` file created successfully  
⚠️ **DATABASE_URL needs to be updated with your actual PostgreSQL credentials**

## Required Updates

### 1. Update DATABASE_URL

The current `.env` file has placeholder credentials. You need to replace them with your actual PostgreSQL connection details.

**Current (placeholder):**
```
DATABASE_URL="postgresql://user:password@localhost:5432/lynda_wedding?schema=public"
```

**Update with your actual credentials:**
```
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/lynda_wedding?schema=public"
```

### Common PostgreSQL Configurations

#### Local PostgreSQL (default)
```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/lynda_wedding?schema=public"
```

#### Docker PostgreSQL
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lynda_wedding?schema=public"
```

#### PostgreSQL on different port
```
DATABASE_URL="postgresql://postgres:password@localhost:5433/lynda_wedding?schema=public"
```

### 2. Create the Database (if it doesn't exist)

Before running migrations, make sure the database exists:

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE lynda_wedding;
```

Or via command line:
```bash
# Windows (if PostgreSQL is in PATH)
psql -U postgres -c "CREATE DATABASE lynda_wedding;"

# Or connect interactively
psql -U postgres
CREATE DATABASE lynda_wedding;
\q
```

### 3. Verify .env File

After updating, verify Prisma can read it:

```bash
npm run db:migrate
```

If you see "Environment variables loaded from .env", it's working correctly.

## Next Steps After Updating DATABASE_URL

1. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

2. **Seed the database:**
   ```bash
   npm run db:seed
   ```

3. **Start the dev server:**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Error: "Authentication failed"
- Check your PostgreSQL username and password
- Verify PostgreSQL is running
- Check if the port is correct (default: 5432)

### Error: "Database does not exist"
- Create the database first (see step 2 above)
- Or update DATABASE_URL to use an existing database

### Error: "Environment variable not found"
- Make sure `.env` file is in the project root
- Check for typos in variable names
- Restart your terminal/IDE after creating `.env`

## Stripe (Payments)

For payment functionality:
- `STRIPE_SECRET_KEY` — Get from https://dashboard.stripe.com/apikeys
- `STRIPE_WEBHOOK_SECRET` — Get from Stripe Dashboard (Webhooks) or Stripe CLI. For local dev: `stripe listen --forward-to localhost:3000/api/billing/webhook`

## Event Image Upload (Vercel Blob)

Event images are stored in **Vercel Blob** (not on the filesystem). Required for the upload API to work:

- `BLOB_READ_WRITE_TOKEN` — From Vercel: Project → Storage → Create Database → Blob, then copy the token. For local development you can create a Vercel project and use its Blob token, or the upload endpoint will return 500 if the token is missing.
