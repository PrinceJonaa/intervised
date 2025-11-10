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
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="w-full sm:w-auto text-center px-4 py-2 bg-deep-blue text-white rounded-lg font-semibold hover:bg-deep-blue-hover transition text-sm sm:text-base min-h-[44px] flex items-center justify-center"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">No blog posts yet. Create your first post!</p>
          <Link
            href="/admin/blog/new"
            className="inline-block px-6 py-3 bg-deep-blue text-white rounded-lg font-semibold hover:bg-deep-blue-hover transition text-sm sm:text-base min-h-[44px]"
          >
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {posts.map(post => (
            <div
              key={post.slug}
              className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 hover:border-light-gold transition"
            >
              <div className="flex flex-col gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-base sm:text-xl font-semibold flex-1 min-w-[200px]">{post.title}</h2>
                    {post.featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded whitespace-nowrap">
                        Featured
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded whitespace-nowrap">
                      {post.pillar}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span>By {post.author}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    {post.tags && post.tags.length > 0 && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs">{post.tags.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-center min-h-[44px] flex items-center justify-center"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/blog/${post.slug}/edit`}
                    className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-center min-h-[44px] flex items-center justify-center"
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
