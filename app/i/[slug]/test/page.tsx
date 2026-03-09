'use client'

import { FincaInvitationPage } from '@/components/templates/finca/FincaInvitationPage'

// Test page that doesn't require database
// Use this to test the intro overlay without database setup
export default function TestInvitationPage() {
  const mockInvitation = {
    slug: 'demo-wedding',
    contentJson: {
      hero: {
        names: ['Sarah', 'John'],
        date: 'June 15, 2025',
        message: 'We are delighted to invite you to celebrate our special day with us.',
      },
    },
    eventDate: new Date('2025-06-15T16:00:00Z'),
    theme: {
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
      },
    },
    events: [
      {
        id: '1',
        name: 'Ceremony',
        startsAt: new Date('2025-06-15T16:00:00Z'),
        endsAt: new Date('2025-06-15T17:00:00Z'),
        locationName: 'Garden Venue',
        address: '123 Wedding Lane, City, State 12345',
        mapLat: 40.7128,
        mapLng: -74.0060,
        notes: 'Please arrive 15 minutes early. Dress code: Semi-formal.',
      },
      {
        id: '2',
        name: 'Reception',
        startsAt: new Date('2025-06-15T18:00:00Z'),
        endsAt: new Date('2025-06-15T23:00:00Z'),
        locationName: 'Reception Hall',
        address: '123 Wedding Lane, City, State 12345',
        mapLat: 40.7128,
        mapLng: -74.0060,
        notes: 'Dinner and dancing to follow.',
      },
    ],
  }

  return <FincaInvitationPage invitation={mockInvitation} />
}
