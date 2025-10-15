import React from 'react'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import ProtectedAdminLayout from '@/app/components/ProtectedAdminLayout'
import DeleteButton from '@/app/components/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminBlogListPage() {
  const posts = getAllPosts()

  return (
    <ProtectedAdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-deep-blue text-white rounded-lg font-semibold hover:bg-deep-blue-hover transition"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No blog posts yet. Create your first post!</p>
          <Link
            href="/admin/blog/new"
            className="inline-block px-6 py-3 bg-deep-blue text-white rounded-lg font-semibold hover:bg-deep-blue-hover transition"
          >
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div
              key={post.slug}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:border-light-gold transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">{post.title}</h2>
                    {post.featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                        Featured
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {post.pillar}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{post.excerpt}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    {post.tags && post.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{post.tags.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/blog/${post.slug}/edit`}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  >
                    Edit
                  </Link>
                  <DeleteButton slug={post.slug} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </ProtectedAdminLayout>
  )
}
