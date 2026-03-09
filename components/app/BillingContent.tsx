'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Payment {
  id: string
  stripeSessionId: string | null
  amount: number
  currency: string
  status: string
  createdAt: Date
}

interface Invitation {
  id: string
  slug: string
  title: string | null
  status: string
  payments: Payment[]
}

interface BillingContentProps {
  invitations: Invitation[]
  searchParams?: {
    success?: string
    canceled?: string
    session_id?: string
    invitationId?: string
  }
}

export function BillingContent({ invitations, searchParams }: BillingContentProps) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams?.success === 'true') {
      // Refresh to show updated payment status
      router.refresh()
      // Show success message briefly
      setTimeout(() => {
        // Payment status will be updated via webhook
      }, 1000)
    }
  }, [searchParams, router])

  const handleCheckout = async (invitationId: string) => {
    setProcessing(invitationId)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start checkout')
      setProcessing(null)
    }
  }

  const getPaymentStatus = (invitation: Invitation) => {
    const paidPayment = invitation.payments.find(
      (p) => p.status === 'PAID'
    )
    if (paidPayment) return { status: 'paid', payment: paidPayment }
    
    const pendingPayment = invitation.payments.find(
      (p) => p.status === 'PENDING'
    )
    if (pendingPayment) return { status: 'pending', payment: pendingPayment }
    
    return { status: 'unpaid', payment: null }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/app"
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Billing & Payments</h1>
          <p className="text-muted-foreground">
            Pay once to publish your invitation. Draft preview is free.
          </p>
          {searchParams?.success === 'true' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                Payment successful! Your payment is being processed. You can publish your invitation once payment is confirmed.
              </p>
            </div>
          )}
          {searchParams?.canceled === 'true' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Payment was canceled. You can try again when ready.
              </p>
            </div>
          )}
        </div>

        {invitations.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have any invitations yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const paymentInfo = getPaymentStatus(invitation)
              const content = invitation.title || invitation.slug

              return (
                <div
                  key={invitation.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{content}</h3>
                      <p className="text-sm text-muted-foreground">
                        {invitation.slug}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        invitation.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {invitation.status}
                    </span>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    {paymentInfo.status === 'paid' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">
                            Payment Complete
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatAmount(
                              paymentInfo.payment!.amount,
                              paymentInfo.payment!.currency
                            )}
                          </span>
                        </div>
                        {invitation.status !== 'PUBLISHED' && (
                          <div className="pt-2">
                            <Link href={`/app/invitations/${invitation.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Publish Now
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : paymentInfo.status === 'pending' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-yellow-600">
                            Payment Pending
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatAmount(
                              paymentInfo.payment!.amount,
                              paymentInfo.payment!.currency
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Complete your payment to publish.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium mb-1">
                            One-time payment to publish
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Draft preview is free. Payment required to make your
                            invitation public.
                          </p>
                        </div>
                        <Button
                          onClick={() => handleCheckout(invitation.id)}
                          disabled={processing === invitation.id}
                        >
                          {processing === invitation.id
                            ? 'Processing...'
                            : 'Pay to Publish'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
