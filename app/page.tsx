import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">Lynda Wedding</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/app">
                <Button>Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
        <div className="text-center space-y-8 max-w-3xl">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              Digital Wedding Invitations
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              Create beautiful, modern wedding invitation websites
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Share your special day with a stunning digital invitation. Collect RSVPs, 
              share event details, and manage your guest list all in one place.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/i/demo-wedding?preview=1">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg">
                View Demo Invitation
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="pt-12 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Quick Links</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/app" className="text-purple-600 hover:text-purple-700 font-medium">
                Owner Dashboard →
              </Link>
              <Link href="/admin" className="text-purple-600 hover:text-purple-700 font-medium">
                Admin Dashboard →
              </Link>
              <Link href="/i/demo-wedding/rsvp?preview=1" className="text-purple-600 hover:text-purple-700 font-medium">
                RSVP Form →
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">Beautiful Designs</h3>
              <p className="text-gray-600 text-sm">
                Choose from elegant themes and customize your invitation to match your style.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">Easy RSVP</h3>
              <p className="text-gray-600 text-sm">
                Guests can RSVP in seconds. Track responses and manage your guest list effortlessly.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">One-Time Payment</h3>
              <p className="text-gray-600 text-sm">
                Pay once to publish. No subscriptions, no hidden fees. Preview is always free.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
