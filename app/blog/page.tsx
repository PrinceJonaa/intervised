import React from 'react'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export default function BlogIndexPage() {
  const blogPosts = getAllPosts()

  const getPillarEmoji = (pillar: string) => {
    const emojis: Record<string, string> = {
      Creative: '🎤',
      Tech: '🧠',
      Ministry: '🙏',
      Captions: '📝',
      Social: '📱',
    }
    return emojis[pillar] || '📄'
  }

  return (
    <section className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">Blog</h2>

      {blogPosts.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-600 text-base sm:text-lg">No blog posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="p-5 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2 bg-white hover:border-light-gold"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg sm:text-xl flex-1">{post.title}</h3>
                {post.featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded whitespace-nowrap">
                    Featured
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 font-semibold rounded text-xs">
                  {getPillarEmoji(post.pillar)} {post.pillar}
                </span>
                {post.tags && post.tags.length > 0 && (
                  <span className="text-gray-500">
                    {post.tags.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-xs sm:text-sm">
                By {post.author} on {new Date(post.date).toLocaleDateString()}
              </p>

              <p className="text-gray-700 text-sm sm:text-base">{post.excerpt}</p>

              <div className="text-deep-blue font-semibold text-xs sm:text-sm pt-2">
                Read more →
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
