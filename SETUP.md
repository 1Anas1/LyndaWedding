# Setup Checklist

For full project description, tech stack, and architecture see **README.md** and the **docs/** folder.

## Prerequisites
- [ ] Node.js 18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] PostgreSQL database running (local or managed service)

## Initial Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `DATABASE_URL`

3. **Set up database**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Create database schema
   pnpm db:migrate
   
   # Seed with demo data
   pnpm db:seed
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

## Verification Steps

After setup, verify everything works:

- [ ] **Homepage loads**: http://localhost:3000
- [ ] **Demo invitation loads**: http://localhost:3000/i/demo-wedding?preview=1
- [ ] **RSVP page loads**: http://localhost:3000/i/demo-wedding/rsvp?preview=1
- [ ] **RSVP submission works**: Submit a test RSVP and verify it saves to database
- [ ] **Owner dashboard placeholder**: http://localhost:3000/app
- [ ] **Admin dashboard placeholder**: http://localhost:3000/admin
- [ ] **Database has data**: Run `pnpm db:studio` and verify seed data exists

## Expected Seed Data

After running `pnpm db:seed`, you should have:

- 2 Themes (Minimal Elegance, Floral Romance)
- 2 Users (owner@example.com, admin@example.com)
- 1 Invitation (slug: `demo-wedding`, status: DRAFT)
- 2 Events (Ceremony, Reception)

## Troubleshooting

### Database connection errors
- Verify `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running
- Check database exists and is accessible

### Prisma client errors
- Run `pnpm db:generate` to regenerate Prisma client
- Ensure `prisma/schema.prisma` is valid

### TypeScript errors
- Run `pnpm install` to ensure all dependencies are installed
- Check `tsconfig.json` paths are correct

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`
