import React from 'react'
import { getPostBySlug } from '@/lib/blog'
import { notFound } from 'next/navigation'
import BlogPostForm from '@/app/components/BlogPostForm'
import ProtectedAdminLayout from '@/app/components/ProtectedAdminLayout'

export const dynamic = 'force-dynamic'

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <ProtectedAdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
        <BlogPostForm post={post} isEditing={true} />
      </div>
    </ProtectedAdminLayout>
  )
}
