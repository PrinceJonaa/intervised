import React from 'react'
import BlogPostForm from '../../../components/BlogPostForm'
import ProtectedAdminLayout from '../../../components/ProtectedAdminLayout'

export default function NewBlogPostPage() {
  return (
    <ProtectedAdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
        <BlogPostForm />
      </div>
    </ProtectedAdminLayout>
  )
}
