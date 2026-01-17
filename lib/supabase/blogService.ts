/**
 * Blog Service - CRUD operations for blog posts and comments
 * 
 * Provides type-safe database operations with real-time subscriptions
 */
import { supabase } from './client';
import type { Database } from './database.types';

// Type aliases for cleaner code
type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];
type BlogComment = Database['public']['Tables']['blog_comments']['Row'];
type BlogCommentInsert = Database['public']['Tables']['blog_comments']['Insert'];
type BlogCategory = Database['public']['Enums']['blog_category'];
type PostStatus = Database['public']['Enums']['post_status'];

// Re-export types for use in components
export type { BlogPost, BlogPostInsert, BlogPostUpdate, BlogComment, BlogCategory, PostStatus };

// ============================================
// BLOG POSTS - READ OPERATIONS
// ============================================

/**
 * Fetch all published blog posts
 */
export async function getPublishedPosts(options?: {
  category?: BlogCategory;
  limit?: number;
  offset?: number;
  orderBy?: 'published_at' | 'views' | 'likes';
}): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order(options?.orderBy || 'published_at', { ascending: false });

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
  return data || [];
}

/**
 * Fetch a single blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching post:', error);
    throw error;
  }
  return data;
}

/**
 * Fetch a single blog post by ID
 */
export async function getPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Search blog posts by title, content, or tags
 */
export async function searchPosts(query: string): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .contains('tags', [tag])
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get all unique tags from published posts
 */
export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('tags')
    .eq('status', 'published');

  if (error) throw error;

  const tagSet = new Set<string>();
  data?.forEach(post => {
    post.tags?.forEach(tag => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

/**
 * Get posts for admin (all statuses)
 */
export async function getAdminPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get post count by status (for admin dashboard)
 */
export async function getPostStats(): Promise<{ published: number; draft: number; archived: number }> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('status');

  if (error) throw error;

  const stats = { published: 0, draft: 0, archived: 0 };
  data?.forEach(post => {
    if (post.status === 'published') stats.published++;
    else if (post.status === 'draft') stats.draft++;
    else if (post.status === 'archived') stats.archived++;
  });

  return stats;
}

// ============================================
// BLOG POSTS - WRITE OPERATIONS
// ============================================

/**
 * Create a new blog post (requires authentication)
 */
export async function createPost(post: BlogPostInsert): Promise<BlogPost> {
  // Generate slug from title if not provided
  const slug = post.slug || generateSlug(post.title);
  const readTime = calculateReadTime(post.content);

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      ...post,
      slug,
      read_time: readTime,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
  return data;
}

/**
 * Update an existing blog post
 */
export async function updatePost(id: string, updates: BlogPostUpdate): Promise<BlogPost> {
  // Recalculate read time if content changed
  const updateData: BlogPostUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.content) {
    updateData.read_time = calculateReadTime(updates.content);
  }

  if (updates.title && !updates.slug) {
    updateData.slug = generateSlug(updates.title);
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    throw error;
  }
  return data;
}

/**
 * Publish a draft post
 */
export async function publishPost(id: string): Promise<BlogPost> {
  return updatePost(id, {
    status: 'published',
    published_at: new Date().toISOString(),
  });
}

/**
 * Unpublish (set to draft) a post
 */
export async function unpublishPost(id: string): Promise<BlogPost> {
  return updatePost(id, { status: 'draft' });
}

/**
 * Archive a post
 */
export async function archivePost(id: string): Promise<BlogPost> {
  return updatePost(id, { status: 'archived' });
}

/**
 * Delete a blog post (admin only)
 */
export async function deletePost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
  return true;
}

/**
 * Increment view count for a post
 */
export async function incrementViews(id: string): Promise<void> {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('views')
    .eq('id', id)
    .single();

  if (post) {
    await supabase
      .from('blog_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', id);
  }
}

/**
 * Toggle like on a post
 */
export async function toggleLike(id: string, increment: boolean): Promise<number> {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('likes')
    .eq('id', id)
    .single();

  if (post) {
    const newLikes = Math.max(0, (post.likes || 0) + (increment ? 1 : -1));
    await supabase
      .from('blog_posts')
      .update({ likes: newLikes })
      .eq('id', id);
    return newLikes;
  }
  return 0;
}

// ============================================
// BLOG COMMENTS
// ============================================

/**
 * Get comments for a post
 */
export async function getComments(postId: string, includeUnapproved = false): Promise<BlogComment[]> {
  let query = supabase
    .from('blog_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (!includeUnapproved) {
    query = query.eq('is_approved', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Add a comment to a post
 */
export async function addComment(comment: BlogCommentInsert): Promise<BlogComment> {
  const { data, error } = await supabase
    .from('blog_comments')
    .insert({
      ...comment,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
  return data;
}

/**
 * Approve a comment (admin only)
 */
export async function approveComment(id: string): Promise<BlogComment> {
  const { data, error } = await supabase
    .from('blog_comments')
    .update({ is_approved: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('blog_comments')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Get pending comments (for admin moderation)
 */
export async function getPendingComments(): Promise<(BlogComment & { post_title?: string })[]> {
  const { data, error } = await supabase
    .from('blog_comments')
    .select(`
      *,
      blog_posts!inner(title)
    `)
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Flatten the response
  return (data || []).map(item => ({
    ...item,
    post_title: (item as any).blog_posts?.title,
  }));
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to new blog posts
 */
export function subscribeToNewPosts(callback: (post: BlogPost) => void) {
  return supabase
    .channel('blog_posts_new')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'blog_posts',
        filter: 'status=eq.published',
      },
      (payload) => callback(payload.new as BlogPost)
    )
    .subscribe();
}

/**
 * Subscribe to post updates
 */
export function subscribeToPostUpdates(postId: string, callback: (post: BlogPost) => void) {
  return supabase
    .channel(`blog_post_${postId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'blog_posts',
        filter: `id=eq.${postId}`,
      },
      (payload) => callback(payload.new as BlogPost)
    )
    .subscribe();
}

/**
 * Subscribe to new comments on a post
 */
export function subscribeToComments(postId: string, callback: (comment: BlogComment) => void) {
  return supabase
    .channel(`blog_comments_${postId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'blog_comments',
        filter: `post_id=eq.${postId}`,
      },
      (payload) => callback(payload.new as BlogComment)
    )
    .subscribe();
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribe(subscription: ReturnType<typeof supabase.channel>) {
  subscription.unsubscribe();
}

// ============================================
// IMAGE UPLOAD
// ============================================

/**
 * Upload a blog featured image
 */
export async function uploadBlogImage(file: File, postSlug: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${postSlug}-${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  const { data } = supabase.storage
    .from('blog-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Delete a blog image
 */
export async function deleteBlogImage(imageUrl: string): Promise<boolean> {
  // Extract file path from URL
  const urlParts = imageUrl.split('/blog-images/');
  if (urlParts.length < 2) return false;

  const filePath = urlParts[1].split('?')[0]; // Remove query params

  const { error } = await supabase.storage
    .from('blog-images')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
  return true;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Generate a URL-safe slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens
    .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
    .slice(0, 100);
}

/**
 * Calculate estimated read time in minutes
 */
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// ============================================
// POST REVISIONS (Version History)
// ============================================

export interface PostRevision {
  id: string;
  post_id: string;
  title: string;
  content: string;
  excerpt: string | null;
  revision_number: number;
  created_at: string;
  created_by: string | null;
}

/**
 * Save a new revision of a post
 */
export async function saveRevision(postId: string, title: string, content: string, excerpt?: string): Promise<PostRevision> {
  // Get current revision count
  const { data: existing } = await supabase
    .from('blog_post_revisions')
    .select('revision_number')
    .eq('post_id', postId)
    .order('revision_number', { ascending: false })
    .limit(1);

  const nextRevision = (existing?.[0]?.revision_number || 0) + 1;

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('blog_post_revisions')
    .insert({
      post_id: postId,
      title,
      content,
      excerpt: excerpt || null,
      revision_number: nextRevision,
      created_by: user?.id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving revision:', error);
    throw error;
  }
  return data as PostRevision;
}

/**
 * Get all revisions for a post
 */
export async function getRevisions(postId: string): Promise<PostRevision[]> {
  const { data, error } = await supabase
    .from('blog_post_revisions')
    .select('*')
    .eq('post_id', postId)
    .order('revision_number', { ascending: false });

  if (error) throw error;
  return (data || []) as PostRevision[];
}

/**
 * Get a specific revision
 */
export async function getRevision(revisionId: string): Promise<PostRevision | null> {
  const { data, error } = await supabase
    .from('blog_post_revisions')
    .select('*')
    .eq('id', revisionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as PostRevision;
}

/**
 * Restore a post to a previous revision
 */
export async function restoreRevision(postId: string, revisionId: string): Promise<BlogPost> {
  const revision = await getRevision(revisionId);
  if (!revision) throw new Error('Revision not found');

  // Save current state as a new revision before restoring
  const { data: currentPost } = await supabase
    .from('blog_posts')
    .select('title, content, excerpt')
    .eq('id', postId)
    .single();

  if (currentPost) {
    await saveRevision(postId, currentPost.title, currentPost.content, currentPost.excerpt || undefined);
  }

  // Restore the old revision
  return updatePost(postId, {
    title: revision.title,
    content: revision.content,
    excerpt: revision.excerpt,
  });
}

// ============================================
// NAMESPACE EXPORT - For convenient grouped access
// ============================================

export const blogService = {
  // Read operations
  getPublishedPosts,
  getPostBySlug,
  getPostById,
  searchPosts,
  getPostsByTag,
  getAllTags,
  getAdminPosts,

  // Write operations
  createPost,
  updatePost,
  deletePost,
  publishPost,
  archivePost,

  // Engagement
  incrementViews,
  toggleLike,

  // Comments
  getComments,
  addComment,
  approveComment,
  deleteComment,

  // Subscriptions
  subscribeToNewPosts,
  subscribeToPostUpdates,
  subscribeToComments,

  // Storage
  uploadBlogImage,
  deleteBlogImage,

  // Revisions
  saveRevision,
  getRevisions,
  getRevision,
  restoreRevision,

  // Utilities
  generateSlug,
  calculateReadTime,
  formatDate,
  formatRelativeTime,
  truncateText,
};
