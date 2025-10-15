import React from 'react'
import Link from 'next/link'
import ProtectedAdminLayout from '../components/ProtectedAdminLayout'

export default function AdminDashboard() {
  return (
    <ProtectedAdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold">Welcome to the Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/blog"
          className="p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition border-2 border-transparent hover:border-light-gold"
        >
          <h2 className="text-2xl font-semibold mb-2">Manage Blog Posts</h2>
          <p className="text-gray-600">View, edit, and delete existing blog posts</p>
        </Link>
        
        <Link
          href="/admin/blog/new"
          className="p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition border-2 border-transparent hover:border-light-gold"
        >
          <h2 className="text-2xl font-semibold mb-2">Create New Post</h2>
          <p className="text-gray-600">Write and publish a new blog post</p>
        </Link>
      </div>

      <div className="bg-blue-50 border-l-4 border-deep-blue p-6 rounded">
        <h3 className="font-semibold text-lg mb-2">📝 Content Creation Tips</h3>
        <ul className="space-y-2 text-gray-700">
          <li><strong>Moment Lens:</strong> What moment made you feel something?</li>
          <li><strong>Testimony Lens:</strong> What story or lesson to tell?</li>
          <li><strong>Hook Lens:</strong> Say it in one line that stops scrolling</li>
          <li><strong>Vision Lens:</strong> Does this align with Intervised's bigger story?</li>
        </ul>
      </div>
    </div>
    </ProtectedAdminLayout>
  )
}
