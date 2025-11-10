import type { Metadata } from 'next'
import '../styles/globals.css'
import React, { type ReactNode } from 'react'
import AuthProvider from './components/AuthProvider'
import ConditionalFooter from './components/ConditionalFooter'
import HeaderAuth from './components/HeaderAuth'
import MobileMenu from './components/MobileMenu'

export const metadata: Metadata = {
  title: 'Intervised LLC',
  description: 'Creative + Tech Services for Creators, Ministries, and Brands',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
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
          <header className="bg-gray-900 text-white p-3 sm:p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-lg sm:text-xl font-bold">Intervised LLC</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <MobileMenu />
              <nav className="flex items-center gap-2 sm:gap-4 lg:gap-8">
                <ul className="hidden md:flex space-x-3 lg:space-x-6 text-sm lg:text-base">
                <li>
                  <a href="/" className="hover:underline hover:text-light-gold transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/services" className="hover:underline hover:text-light-gold transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/booking" className="hover:underline hover:text-light-gold transition-colors">
                    Booking
                  </a>
                </li>
                <li>
                  <a href="/team" className="hover:underline hover:text-light-gold transition-colors">
                    Team
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:underline hover:text-light-gold transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/blog" className="hover:underline hover:text-light-gold transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
              <HeaderAuth />
              </nav>
            </div>
          </div>
        </header>
        <main className="grow container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">{children}</main>
        <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  )
}
