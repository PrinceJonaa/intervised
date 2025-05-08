import React from 'react'

// Placeholder data for a single blog post
const placeholderPost = {
  slug: 'placeholder-post-1',
  title: 'Coming Soon: Our First Blog Post',
  author: 'Intervised LLC',
  date: '2023-10-27',
  content: `
    <p>This is a placeholder for your first blog post. We are excited to share our thoughts and insights on creative and tech topics with you soon!</p>
    <p>Stay tuned for updates!</p>
  `, // Basic HTML content
}

// Function to generate static params for dynamic routes
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  // In a real application, you would fetch slugs from your CMS (e.g., Sanity)
  const posts = [
    { slug: 'placeholder-post-1' },
    // Add slugs for other placeholder posts here
  ]

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }) {
  return {
    title: `Blog: ${params.slug}`,
  };
}

export default function BlogPostPage({ params }) {
  // In a real application, you would fetch the post content based on the slug
  // For this MVP, we'll just use the placeholder data
  const post = placeholderPost // In a real app: fetchPostBySlug(params.slug)

  if (!post) {
    return <div>Post not found</div> // Or a proper 404 page
  }

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-center">{post.title}</h1>
      <p className="text-gray-600 text-center text-sm">
        By {post.author} on {new Date(post.date).toLocaleDateString()}
      </p>
      <div
        className="prose lg:prose-xl mx-auto" // Use Tailwind Typography if available
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}
