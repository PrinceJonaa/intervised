import React from 'react'

export default function BlogIndexPage() {
  // Placeholder data for blog posts
  const blogPosts = [
    {
      slug: 'placeholder-post-1',
      title: 'Coming Soon: Our First Blog Post',
      author: 'Intervised LLC',
      date: '2023-10-27',
      excerpt: 'Stay tuned for insightful articles on creative and tech topics!',
    },
    // Add more placeholder posts as needed
  ]

  return (
    <section className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">Blog</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogPosts.map((post) => (
          <div key={post.slug} className="p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
            <h3 className="font-semibold text-xl">
              <a href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
                {post.title}
              </a>
            </h3>
            <p className="text-gray-600 text-sm">
              By {post.author} on {new Date(post.date).toLocaleDateString()}
            </p>
            <p className="text-gray-700">{post.excerpt}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
