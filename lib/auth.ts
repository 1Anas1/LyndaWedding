import { auth } from '@/auth'
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user) {
    return null
  }
  return session.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  if (user.role !== role) {
    redirect('/unauthorized')
  }
  return user
}

export async function requireOwner() {
  return requireRole(UserRole.OWNER)
}

export async function requireAdmin() {
  return requireRole(UserRole.ADMIN)
}
