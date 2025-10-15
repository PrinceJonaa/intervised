import type { Metadata } from 'next'
import '../styles/globals.css'
import React, { type ReactNode } from 'react'
import AuthProvider from './components/AuthProvider'
import ConditionalFooter from './components/ConditionalFooter'
import HeaderAuth from './components/HeaderAuth'

export const metadata: Metadata = {
  title: 'Intervised LLC',
  description: 'Creative + Tech Services for Creators, Ministries, and Brands',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <header className="bg-gray-900 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Intervised LLC</h1>
            <nav className="flex items-center gap-8">
              <ul className="flex space-x-6">
                <li>
                  <a href="/" className="hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/services" className="hover:underline">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/booking" className="hover:underline">
                    Booking
                  </a>
                </li>
                <li>
                  <a href="/team" className="hover:underline">
                    Team
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:underline">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/blog" className="hover:underline">
                    Blog
                  </a>
                </li>
              </ul>
              <HeaderAuth />
            </nav>
          </div>
        </header>
        <main className="grow container mx-auto px-4 py-8">{children}</main>
        <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  )
}
