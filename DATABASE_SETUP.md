# Database Setup Guide

## Current Issue
The application can't connect to PostgreSQL at `localhost:5432`.

## Quick Solutions

### Option 1: Use Docker (Easiest)

1. **Install Docker Desktop** (if not installed)
   - Download from: https://www.docker.com/products/docker-desktop

2. **Run PostgreSQL in Docker:**
   ```bash
   docker run --name lynda-wedding-db -e POSTGRES_PASSWORD=password123 -e POSTGRES_USER=postgres -e POSTGRES_DB=lynda_wedding -p 5432:5432 -d postgres:15
   ```

3. **Update .env file:**
   ```
   DATABASE_URL="postgresql://postgres:password123@localhost:5432/lynda_wedding?schema=public"
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

### Option 2: Install PostgreSQL Locally

1. **Download PostgreSQL:**
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql@15`
   - Linux: `sudo apt-get install postgresql`

2. **Start PostgreSQL service:**
   - Windows: Services → PostgreSQL → Start
   - Mac/Linux: `brew services start postgresql` or `sudo systemctl start postgresql`

3. **Create database:**
   ```bash
   psql -U postgres
   CREATE DATABASE lynda_wedding;
   \q
   ```

4. **Update .env with your credentials:**
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/lynda_wedding?schema=public"
   ```

5. **Run migrations:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

### Option 3: Use Cloud Database (Free Tier)

**Neon (Recommended - Free Tier):**
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `.env`:
   ```
   DATABASE_URL="your-neon-connection-string"
   ```
5. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

**Other options:**
- Supabase (free tier)
- Railway (free tier)
- Render (free tier)

## Test Without Database (Intro Overlay Only)

To test just the intro overlay without database:

1. **Visit the test page:**
   ```
   http://localhost:3000/i/demo-wedding/test
   ```

   This uses mock data and doesn't require database connection.

## Verify Database Connection

After setting up database, test connection:

```bash
# Test Prisma connection
npm run db:studio
```

If Prisma Studio opens, your database is connected correctly.

## Current .env Status

Check your `.env` file and ensure:
- `DATABASE_URL` is set correctly
- Credentials match your PostgreSQL setup
- Database exists and is accessible
