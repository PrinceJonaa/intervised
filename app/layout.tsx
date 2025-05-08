import type { Metadata } from 'next'
import '../styles/globals.css'
import React, { type ReactNode } from 'react'

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
        <header className="bg-gray-900 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Intervised LLC</h1>
            <nav>
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
            </nav>
          </div>
        </header>
        <main className="grow container mx-auto px-4 py-8">{children}</main>
        <footer className="bg-gray-900 text-white p-4 mt-12">
          <div className="container mx-auto text-center text-sm">
            &copy; {new Date().getFullYear()} Intervised LLC. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  )
}
