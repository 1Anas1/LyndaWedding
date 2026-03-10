import { PrismaClient, UserRole, InvitationStatus, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create or update themes (Theme has no unique on name, use findFirst)
  const theme1 =
    (await prisma.theme.findFirst({ where: { name: 'Minimal Elegance' } })) ??
    (await prisma.theme.create({
      data: {
        name: 'Minimal Elegance',
        isActive: true,
        tokensJson: {
          colors: {
            bg: '#ffffff',
            surface: '#f9fafb',
            text: '#111827',
            muted: '#6b7280',
            accent: '#8b5cf6',
          },
          fonts: {
            headingFont: 'Inter, sans-serif',
            bodyFont: 'Inter, sans-serif',
          },
          radius: '8px',
          spacing: {
            xs: '0.5rem',
            sm: '1rem',
            md: '1.5rem',
            lg: '2rem',
            xl: '3rem',
          },
        },
      },
    }))

  const theme2 =
    (await prisma.theme.findFirst({ where: { name: 'Floral Romance' } })) ??
    (await prisma.theme.create({
      data: {
        name: 'Floral Romance',
        isActive: true,
        tokensJson: {
          colors: {
            bg: '#fef7f0',
            surface: '#fff9f5',
            text: '#2d1810',
            muted: '#8b6f5e',
            accent: '#d4a574',
          },
          fonts: {
            headingFont: 'Playfair Display, serif',
            bodyFont: 'Lora, serif',
          },
          radius: '12px',
          spacing: {
            xs: '0.5rem',
            sm: '1rem',
            md: '1.5rem',
            lg: '2rem',
            xl: '3rem',
          },
        },
      },
    }))

  console.log('Created themes:', theme1.name, theme2.name)

  // Simple user (OWNER) – dashboard, create invitations
  const userPassword = await bcrypt.hash('password123', 10)
  const simpleUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    create: {
      email: 'user@example.com',
      name: 'Simple User',
      password: userPassword,
      role: UserRole.OWNER,
    },
    update: { password: userPassword, name: 'Simple User', role: UserRole.OWNER },
  })

  // Admin user (ADMIN) – admin area
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
    update: { password: adminPassword, name: 'Admin User', role: UserRole.ADMIN },
  })

  // Dedicated demo account for Lynda & Aymen – no password, cannot log in.
  // Invitation is owned by this account. Guests access via sharing links only.
  const demoOwner = await prisma.user.upsert({
    where: { email: 'lynda-aymen@demo.wedding' },
    create: {
      email: 'lynda-aymen@demo.wedding',
      name: 'Lynda & Aymen',
      password: null, // No login – guests access invitations via link only
      role: UserRole.OWNER,
    },
    update: { name: 'Lynda & Aymen', password: null, role: UserRole.OWNER },
  })

  console.log('Created users:', simpleUser.email, adminUser.email, demoOwner.email)
  console.log('\n--- Login (dashboard / admin) ---')
  console.log('Simple user (OWNER): user@example.com / password123')
  console.log('Admin user (ADMIN):  admin@example.com / admin123')
  console.log('---\n')

  // Create or update invitation – owned by demo account
  const invitation = await prisma.invitation.upsert({
    where: { slug: 'demo-wedding' },
    create: {
      ownerId: demoOwner.id,
      slug: 'demo-wedding',
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'Demo Wedding',
      locale: 'en',
      eventDate: new Date('2026-04-09T06:15:00Z'),
      themeId: theme1.id,
      contentJson: {
        hero: {
          names: ['Lynda', 'Aymen'],
          date: '09/04/2026',
          message: 'Nous avons le plaisir de vous inviter à célébrer notre jour le plus spécial avec nous.',
        },
        sections: {
          story: {
            enabled: true,
            content: 'Nous nous sommes rencontrés il y a cinq ans et avons su immédiatement que nous étions faits l\'un pour l\'autre.',
          },
          countdown: { enabled: true },
          registry: { enabled: false },
        },
        faqs: [],
        guestMessageSection: { enabled: true, label: 'Écrivez un mot' },
        accommodations: [],
      },
      settingsJson: {
        rsvpEnabled: true,
        previewEnabled: true,
        allowEdit: false,
        requireEmail: false,
        requirePhone: false,
      },
    },
    update: {
      ownerId: demoOwner.id,
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      themeId: theme1.id,
      eventDate: new Date('2026-04-09T06:15:00Z'),
      contentJson: {
        hero: {
          names: ['Lynda', 'Aymen'],
          date: '09/04/2026',
          message: 'Nous avons le plaisir de vous inviter à célébrer notre jour le plus spécial avec nous.',
        },
        sections: { story: { enabled: true, content: 'Nous nous sommes rencontrés il y a cinq ans et avons su immédiatement que nous étions faits l\'un pour l\'autre.' }, countdown: { enabled: true }, registry: { enabled: false } },
        faqs: [],
        guestMessageSection: { enabled: true, label: 'Écrivez un mot' },
        accommodations: [],
      },
      settingsJson: {
        rsvpEnabled: true,
        previewEnabled: true,
        allowEdit: false,
        requireEmail: false,
        requirePhone: false,
      },
    },
  })

  console.log('Created invitation:', invitation.slug)

  // Delete existing events for this invitation, then create
  await prisma.event.deleteMany({ where: { invitationId: invitation.id } })

  const ceremony = await prisma.event.create({
    data: {
      invitationId: invitation.id,
      name: 'Cérémonie',
      startsAt: new Date('2026-04-09T06:15:00Z'),
      endsAt: new Date('2026-04-09T07:15:00Z'),
      locationName: 'Kobet Nhas',
      address: 'Kobet Nhas',
      mapLat: 40.7128,
      mapLng: -74.0060,
      notes: 'Merci d\'arriver 15 minutes à l\'avance. Tenue : semi-formelle.',
    },
  })

  const reception = await prisma.event.create({
    data: {
      invitationId: invitation.id,
      name: 'Réception',
      startsAt: new Date('2026-04-09T08:00:00Z'),
      endsAt: new Date('2026-04-09T23:00:00Z'),
      locationName: 'Kobet Nhas',
      address: 'Kobet Nhas',
      mapLat: 40.7128,
      mapLng: -74.0060,
      notes: 'Dîner et soirée dansante.',
    },
  })

  console.log('Created events:', ceremony.name, reception.name)

  // Sharing links for the demo invitation (no login required – guests access via link only)
  const baseUrl = process.env.APP_URL || 'http://localhost:3000'
  console.log('\n--- Sharing links for Lynda & Aymen (demo-wedding) ---')
  console.log(`By user ID: ${baseUrl}/u/${demoOwner.id}`)
  console.log(`By slug:    ${baseUrl}/i/demo-wedding`)
  console.log(`Alt:        ${baseUrl}/wedding`)
  console.log('--- Guests need no account. Share these links only. ---\n')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
