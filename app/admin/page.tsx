import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function AdminDashboard() {
  const user = await requireAdmin()

  const stats = {
    totalUsers: await db.user.count(),
    totalInvitations: await db.invitation.count(),
    publishedInvitations: await db.invitation.count({
      where: { status: 'PUBLISHED' },
    }),
    totalRSVPs: await db.rSVP.count(),
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {user.name || user.email}
            </p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground px-3 py-1 rounded hover:bg-muted transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Total Users
            </h3>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Total Invitations
            </h3>
            <p className="text-2xl font-bold">{stats.totalInvitations}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Published
            </h3>
            <p className="text-2xl font-bold">{stats.publishedInvitations}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Total RSVPs
            </h3>
            <p className="text-2xl font-bold">{stats.totalRSVPs}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
