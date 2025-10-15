'use client'

import { usePathname } from 'next/navigation'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Hide footer on booking page
  if (pathname === '/booking') {
    return null
  }
  
  return (
    <footer className="bg-gray-900 text-white p-4 mt-12">
      <div className="container mx-auto text-center text-sm">
        &copy; {new Date().getFullYear()} Intervised LLC. All rights reserved.
      </div>
    </footer>
  )
}
