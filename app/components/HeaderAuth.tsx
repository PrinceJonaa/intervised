'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

// Admin emails list (client-side check)
const ADMIN_EMAILS = [
  'jonathanbonner128@gmail.com',
  'reina.hondo@gmail.com'
]

export default function HeaderAuth() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="text-xs text-gray-400">
        Loading...
      </div>
    )
  }

  if (session) {
    const userIsAdmin = session.user?.email && ADMIN_EMAILS.includes(session.user.email)
    
    return (
      <div className="flex items-center gap-3">
        {userIsAdmin && (
          <a
            href="/admin"
            className="text-sm px-3 py-1 bg-light-gold text-gray-900 hover:bg-medium-gold rounded transition-colors font-semibold"
          >
            Admin Panel
          </a>
        )}
        <span className="text-sm text-gray-300">
          {session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors font-semibold"
    >
      Sign In with Google
    </button>
  )
}
