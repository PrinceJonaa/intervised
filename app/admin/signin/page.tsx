import React from 'react'
import SignInButton from '../../components/SignInButton'

export default function SignInPage() {
  return (
    <section className="max-w-md mx-auto mt-20 text-center space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Admin Sign In</h2>
        <p className="text-gray-600">
          Sign in with your authorized Google account to access the admin dashboard.
        </p>
      </div>
      
      <SignInButton />
      
      <p className="text-sm text-gray-500">
        Only authorized email addresses can access the admin area.
      </p>
    </section>
  )
}
