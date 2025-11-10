'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BlogPost } from '@/lib/blog'

interface BlogPostFormProps {
  post?: BlogPost
  isEditing?: boolean
}

export default function BlogPostForm({ post, isEditing = false }: BlogPostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: post?.title || '',
    author: post?.author || 'Jona',
    date: post?.date || new Date().toISOString().split('T')[0],
    pillar: post?.pillar || 'Creative',
    excerpt: post?.excerpt || '',
    tags: post?.tags?.join(', ') || '',
    featured: post?.featured || false,
    content: post?.content || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      }

      const url = isEditing ? `/api/blog/${post?.slug}` : '/api/blog'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save post')
      }

      const savedPost = await response.json()
      router.push(`/admin/blog`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded text-sm sm:text-base">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-2">Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-deep-blue focus:border-transparent text-base"
          placeholder="Your Post Title"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Author *</label>
          <select
            value={formData.author}
            onChange={e => setFormData({ ...formData, author: e.target.value as any })}
            className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-deep-blue focus:border-transparent text-base"
          >
            <option value="Jona">Jona</option>
            <option value="Reina">Reina</option>
            <option value="Team">Team</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Date *</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-deep-blue focus:border-transparent text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Pillar *</label>
          <select
            value={formData.pillar}
            onChange={e => setFormData({ ...formData, pillar: e.target.value as any })}
            className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-deep-blue focus:border-transparent text-base"
          >
            <option value="Creative">🎤 Creative</option>
            <option value="Tech">🧠 Tech</option>
            <option value="Ministry">🙏 Ministry</option>
            <option value="Captions">📝 Captions</option>
            <option value="Social">📱 Social</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Excerpt *</label>
        <textarea
          required
          value={formData.excerpt}
          onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-deep-blue focus:border-transparent text-base"
          rows={2}
          placeholder="Brief description for listing page"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Tags (comma-separated)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={e => setFormData({ ...formData, tags: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-deep-blue focus:border-transparent text-base"
          placeholder="worship, tech, tutorial"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={e => setFormData({ ...formData, featured: e.target.checked })}
            className="w-5 h-5 text-deep-blue focus:ring-deep-blue"
          />
          <span className="text-sm font-semibold">Featured Post</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Content (Markdown) *</label>
        <textarea
          required
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-deep-blue focus:border-transparent font-mono text-sm sm:text-base"
          rows={20}
          placeholder="# Your Post Content Here&#10;&#10;Write in **Markdown** format..."
        />
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Use Markdown formatting: # Headers, **bold**, *italic*, [links](url), etc.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-deep-blue text-white rounded-lg font-semibold hover:bg-deep-blue-hover transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition min-h-[44px] text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
