import React from 'react'
import SignInButton from '../../components/SignInButton'

export default function SignInPage() {
  return (
    <section className="max-w-md mx-auto mt-12 sm:mt-20 text-center space-y-6 sm:space-y-8 px-4 sm:px-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Admin Sign In</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Sign in with your authorized Google account to access the admin dashboard.
        </p>
      </div>
      
      <SignInButton />
      
      <p className="text-xs sm:text-sm text-gray-500">
        Only authorized email addresses can access the admin area.
      </p>
    </section>
  )
}
