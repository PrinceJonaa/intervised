import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/next-auth'
import { getAllPosts, createPost } from '@/lib/blog'
import { isAdmin } from '@/lib/auth'

// GET all blog posts
export async function GET() {
  try {
    const posts = getAllPosts()
    return NextResponse.json(posts)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create new blog post (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !isAdmin(session.user?.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const post = createPost(body)
    
    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
