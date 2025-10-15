import React, { type ReactNode } from 'react'

// This is a simple wrapper - auth protection happens in individual pages
export default function AdminLayout({ 
  children 
}: { 
  children: ReactNode 
}) {
  return <>{children}</>
}
