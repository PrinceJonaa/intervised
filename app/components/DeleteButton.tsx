'use client'

import React from 'react'

interface DeleteButtonProps {
  slug: string
}

export default function DeleteButton({ slug }: DeleteButtonProps) {
  const [loading, setLoading] = React.useState(false)
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      window.location.reload()
    } catch (error) {
      alert('Failed to delete post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50 min-h-[44px] flex items-center justify-center"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
