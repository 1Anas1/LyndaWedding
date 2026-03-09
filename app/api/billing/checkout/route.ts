import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/auth'
import Stripe from 'stripe'
import { z } from 'zod'

const checkoutSchema = z.object({
  invitationId: z.string().min(1),
})

// Initialize Stripe
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  })
}

const PAYMENT_AMOUNT = 2999 // $29.99 in cents

export async function POST(request: NextRequest) {
  try {
    const user = await requireOwner()
    const stripe = getStripe()
    const body = await request.json()
    const validated = checkoutSchema.parse(body)

    // Find invitation
    const invitation = await db.invitation.findUnique({
      where: { id: validated.invitationId },
      include: {
        owner: true,
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Verify invitation belongs to current user
    if (invitation.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if already paid
    const existingPaidPayment = await db.payment.findFirst({
      where: {
        invitationId: invitation.id,
        status: 'PAID',
      },
    })

    if (existingPaidPayment) {
      return NextResponse.json(
        { error: 'Payment already completed for this invitation' },
        { status: 400 }
      )
    }

    // Get base URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Wedding Invitation: ${invitation.title || invitation.slug}`,
              description: 'One-time payment to publish your digital wedding invitation',
            },
            unit_amount: PAYMENT_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/app/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/app/billing?canceled=true`,
      metadata: {
        invitationId: invitation.id,
      },
    })

    // Create or update payment record
    await db.payment.upsert({
      where: {
        stripeSessionId: session.id,
      },
      create: {
        invitationId: invitation.id,
        stripeSessionId: session.id,
        amount: PAYMENT_AMOUNT,
        currency: 'usd',
        status: 'PENDING',
      },
      update: {
        status: 'PENDING',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error:', error.message)
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      )
    }

    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
