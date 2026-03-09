import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  })
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      const error = err as Error
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${error.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Find payment by session ID
      const payment = await db.payment.findUnique({
        where: {
          stripeSessionId: session.id,
        },
        include: {
          invitation: true,
        },
      })

      if (!payment) {
        console.error(`Payment not found for session ${session.id}`)
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        )
      }

      // Update payment status to PAID
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          stripePaymentIntentId: session.payment_intent as string | undefined,
        },
      })

      console.log(`Payment ${payment.id} marked as PAID for invitation ${payment.invitationId}`)
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Find payment by session ID
      const payment = await db.payment.findUnique({
        where: {
          stripeSessionId: session.id,
        },
      })

      if (payment) {
        // Update payment status to FAILED
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
          },
        })

        console.log(`Payment ${payment.id} marked as FAILED`)
      }
    }

      return NextResponse.json({ received: true })
    } catch (error) {
      if (error instanceof Error && error.message.includes('STRIPE_SECRET_KEY')) {
        return NextResponse.json(
          { error: 'Stripe not configured' },
          { status: 500 }
        )
      }
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: 'Error processing webhook' },
        { status: 500 }
      )
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('STRIPE_SECRET_KEY')) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
