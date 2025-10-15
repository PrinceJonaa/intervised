import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  author: 'Jona' | 'Reina' | 'Team'
  date: string
  pillar: 'Creative' | 'Tech' | 'Ministry' | 'Captions' | 'Social'
  featured?: boolean
  excerpt: string
  tags?: string[]
  content: string
}

// Ensure the blog directory exists
function ensureBlogDir() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
  }
}

// Get all blog posts
export function getAllPosts(): BlogPost[] {
  ensureBlogDir()
  
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        title: data.title || 'Untitled',
        author: data.author || 'Team',
        date: data.date || new Date().toISOString().split('T')[0],
        pillar: data.pillar || 'Creative',
        featured: data.featured || false,
        excerpt: data.excerpt || '',
        tags: data.tags || [],
        content,
      } as BlogPost
    })

  // Sort posts by date
  return allPostsData.sort((a, b) => (a.date > b.date ? -1 : 1))
}

// Get a single post by slug
export function getPostBySlug(slug: string): BlogPost | null {
  ensureBlogDir()
  
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug,
    title: data.title || 'Untitled',
    author: data.author || 'Team',
    date: data.date || new Date().toISOString().split('T')[0],
    pillar: data.pillar || 'Creative',
    featured: data.featured || false,
    excerpt: data.excerpt || '',
    tags: data.tags || [],
    content,
  } as BlogPost
}

// Create a new blog post
export function createPost(post: Omit<BlogPost, 'slug'>): BlogPost {
  ensureBlogDir()
  
  // Generate slug from title
  const slug = post.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const fullPath = path.join(postsDirectory, `${slug}.md`)

  // Check if file already exists
  if (fs.existsSync(fullPath)) {
    throw new Error('A post with this slug already exists')
  }

  const frontmatter = {
    title: post.title,
    author: post.author,
    date: post.date,
    pillar: post.pillar,
    featured: post.featured || false,
    excerpt: post.excerpt,
    tags: post.tags || [],
  }

  const fileContent = matter.stringify(post.content, frontmatter)
  fs.writeFileSync(fullPath, fileContent)

  return { ...post, slug }
}

// Update an existing blog post
export function updatePost(slug: string, post: Partial<BlogPost>): BlogPost {
  ensureBlogDir()
  
  const fullPath = path.join(postsDirectory, `${slug}.md`)

  if (!fs.existsSync(fullPath)) {
    throw new Error('Post not found')
  }

  // Read existing post
  const existingPost = getPostBySlug(slug)
  if (!existingPost) {
    throw new Error('Post not found')
  }

  // Merge updates
  const updatedPost = { ...existingPost, ...post }

  const frontmatter = {
    title: updatedPost.title,
    author: updatedPost.author,
    date: updatedPost.date,
    pillar: updatedPost.pillar,
    featured: updatedPost.featured || false,
    excerpt: updatedPost.excerpt,
    tags: updatedPost.tags || [],
  }

  const fileContent = matter.stringify(updatedPost.content, frontmatter)
  fs.writeFileSync(fullPath, fileContent)

  return updatedPost
}

// Delete a blog post
export function deletePost(slug: string): void {
  ensureBlogDir()
  
  const fullPath = path.join(postsDirectory, `${slug}.md`)

  if (!fs.existsSync(fullPath)) {
    throw new Error('Post not found')
  }

  fs.unlinkSync(fullPath)
}

// Get all slugs for static generation
export function getAllSlugs(): string[] {
  ensureBlogDir()
  
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''))
}
