import { auth } from '@/lib/next-auth'
import { redirect } from 'next/navigation'
import React, { type ReactNode } from 'react'
import Link from 'next/link'
import { isAdmin } from '@/lib/auth'

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/admin/signin')
  }

  // Check if user's email is in the admin list
  if (!isAdmin(session.user?.email)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-deep-blue text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-xl font-bold hover:text-light-gold transition">
                Admin Dashboard
              </Link>
              <div className="flex gap-6">
                <Link href="/admin/blog" className="hover:text-light-gold transition">
                  Blog Posts
                </Link>
                <Link href="/admin/blog/new" className="hover:text-light-gold transition">
                  New Post
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{session.user?.email}</span>
              <Link href="/" className="text-sm hover:text-light-gold transition">
                View Site
              </Link>
              <Link
                href="/api/auth/signout"
                className="text-sm px-3 py-1 border border-white rounded hover:bg-white hover:text-deep-blue transition"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
