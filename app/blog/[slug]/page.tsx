import React from 'react'
import { getPostBySlug, getAllSlugs } from '@/lib/blog'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const dynamic = 'force-dynamic'

// Function to generate static params for dynamic routes
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | Intervised Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

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
    <article className="max-w-3xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6">
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">{post.title}</h1>
        
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
          <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 font-semibold rounded">
            {getPillarEmoji(post.pillar)} {post.pillar}
          </span>
          {post.featured && (
            <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 font-semibold rounded">
              Featured
            </span>
          )}
        </div>

        <p className="text-gray-600 text-center text-xs sm:text-sm">
          By {post.author} on {new Date(post.date).toLocaleDateString()}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {post.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="border-t pt-4 sm:pt-6">
        <a
          href="/blog"
          className="text-deep-blue hover:text-deep-blue-hover font-semibold transition text-sm sm:text-base inline-flex items-center min-h-[44px]"
        >
          ← Back to Blog
        </a>
      </div>
    </article>
  )
}
