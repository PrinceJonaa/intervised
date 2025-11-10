'use client'

import { useState } from 'react'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 hover:bg-gray-800 rounded transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-[57px] left-0 right-0 bg-gray-900 shadow-lg z-50 md:hidden animate-slide-down">
            <nav className="container mx-auto p-4">
              <ul className="space-y-4">
                <li>
                  <a
                    href="/"
                    className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/services"
                    className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="/booking"
                    className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Booking
                  </a>
                </li>
                <li>
                  <a
                    href="/team"
                    className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Team
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
