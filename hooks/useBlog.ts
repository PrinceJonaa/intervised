/**
 * React hooks for blog functionality
 * 
 * Provides easy-to-use hooks for fetching, displaying, and managing blog posts
 */
import { useState, useEffect, useCallback } from 'react';
import * as blogService from '../lib/supabase/blogService';
import type { BlogPost, BlogComment, BlogCategory } from '../lib/supabase/blogService';

// Re-export types for convenience
export type { BlogPost, BlogComment, BlogCategory };
export { formatDate, formatRelativeTime } from '../lib/supabase/blogService';

/**
 * Hook to fetch and manage blog posts list
 */
export function useBlogPosts(options?: {
  category?: BlogCategory;
  limit?: number;
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogService.getPublishedPosts(options);
      setPosts(data);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options?.category, options?.limit]);

  useEffect(() => {
    fetchPosts();

    // Subscribe to new posts for real-time updates
    const subscription = blogService.subscribeToNewPosts((newPost) => {
      // Add new post to the beginning of the list
      setPosts(prev => [newPost, ...prev]);
    });

    return () => {
      blogService.unsubscribe(subscription);
    };
  }, [fetchPosts]);

  return { 
    posts, 
    loading,
    isLoading: loading, // Alias for compatibility
    error, 
    refetch: fetchPosts,
    isEmpty: !loading && posts.length === 0,
  };
}

/**
 * Hook to fetch a single blog post by slug
 */
export function useBlogPost(slug: string | undefined) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function fetchPost() {
      try {
        setLoading(true);
        setError(null);

        const postData = await blogService.getPostBySlug(slug);
        
        if (!postData) {
          setError(new Error('Post not found'));
          setPost(null);
          setComments([]);
          return;
        }

        setPost(postData);

        // Increment views (fire and forget)
        blogService.incrementViews(postData.id).catch(console.error);
        
        // Fetch comments
        const commentsData = await blogService.getComments(postData.id);
        setComments(commentsData);

      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  // Subscribe to real-time updates when we have a post
  useEffect(() => {
    if (!post?.id) return;

    // Subscribe to post updates (likes, views, etc.)
    const postSub = blogService.subscribeToPostUpdates(post.id, (updated) => {
      setPost(updated);
    });

    // Subscribe to new comments
    const commentSub = blogService.subscribeToComments(post.id, (newComment) => {
      // Only add if approved (or let admin see all)
      if (newComment.is_approved) {
        setComments(prev => [...prev, newComment]);
      }
    });

    return () => {
      blogService.unsubscribe(postSub);
      blogService.unsubscribe(commentSub);
    };
  }, [post?.id]);

  /**
   * Add a comment to the current post
   */
  const addComment = async (content: string, authorName: string, authorAvatar?: string) => {
    if (!post?.id) throw new Error('No post loaded');

    const comment = await blogService.addComment({
      post_id: post.id,
      author_name: authorName,
      content,
      author_avatar: authorAvatar,
    });

    // Optimistically add if auto-approved
    if (comment.is_approved) {
      setComments(prev => [...prev, comment]);
    }

    return comment;
  };

  /**
   * Toggle like on the current post
   */
  const toggleLike = async (liked: boolean) => {
    if (!post?.id) return;
    
    // Optimistic update
    setPost(prev => prev ? { 
      ...prev, 
      likes: Math.max(0, (prev.likes || 0) + (liked ? 1 : -1)) 
    } : null);

    try {
      await blogService.toggleLike(post.id, liked);
    } catch (err) {
      // Revert on error
      setPost(prev => prev ? { 
        ...prev, 
        likes: Math.max(0, (prev.likes || 0) + (liked ? -1 : 1)) 
      } : null);
      throw err;
    }
  };

  return { 
    post, 
    comments, 
    loading, 
    error, 
    addComment, 
    toggleLike,
    notFound: !loading && !post && !error,
  };
}

/**
 * Hook for blog search functionality
 */
export function useBlogSearch() {
  const [results, setResults] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState('');

  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await blogService.searchPosts(searchQuery);
      setResults(data);
    } catch (err) {
      console.error('Error searching posts:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return { 
    results, 
    loading, 
    error, 
    query,
    search, 
    clear,
    hasResults: results.length > 0,
  };
}

/**
 * Hook for blog tags
 */
export function useBlogTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    blogService.getAllTags()
      .then(setTags)
      .catch(err => {
        console.error('Error fetching tags:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { tags, loading, error };
}

/**
 * Hook for posts filtered by tag
 */
export function usePostsByTag(tag: string | undefined) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tag) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    blogService.getPostsByTag(tag)
      .then(setPosts)
      .catch(err => {
        console.error('Error fetching posts by tag:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [tag]);

  return { posts, loading, error };
}

/**
 * Hook for admin blog management
 */
export function useAdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState({ published: 0, draft: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [postsData, statsData] = await Promise.all([
        blogService.getAdminPosts(),
        blogService.getPostStats(),
      ]);
      
      setPosts(postsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching admin blog data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createPost = async (post: blogService.BlogPostInsert) => {
    const newPost = await blogService.createPost(post);
    setPosts(prev => [newPost, ...prev]);
    setStats(prev => ({ ...prev, draft: prev.draft + 1 }));
    return newPost;
  };

  const updatePost = async (id: string, updates: blogService.BlogPostUpdate) => {
    const updated = await blogService.updatePost(id, updates);
    setPosts(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const publishPost = async (id: string) => {
    const updated = await blogService.publishPost(id);
    setPosts(prev => prev.map(p => p.id === id ? updated : p));
    setStats(prev => ({ ...prev, published: prev.published + 1, draft: prev.draft - 1 }));
    return updated;
  };

  const unpublishPost = async (id: string) => {
    const updated = await blogService.unpublishPost(id);
    setPosts(prev => prev.map(p => p.id === id ? updated : p));
    setStats(prev => ({ ...prev, published: prev.published - 1, draft: prev.draft + 1 }));
    return updated;
  };

  const archivePost = async (id: string) => {
    const post = posts.find(p => p.id === id);
    const updated = await blogService.archivePost(id);
    setPosts(prev => prev.map(p => p.id === id ? updated : p));
    
    if (post?.status === 'published') {
      setStats(prev => ({ ...prev, published: prev.published - 1, archived: prev.archived + 1 }));
    } else if (post?.status === 'draft') {
      setStats(prev => ({ ...prev, draft: prev.draft - 1, archived: prev.archived + 1 }));
    }
    
    return updated;
  };

  const deletePost = async (id: string) => {
    const post = posts.find(p => p.id === id);
    await blogService.deletePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
    
    if (post?.status === 'published') {
      setStats(prev => ({ ...prev, published: prev.published - 1 }));
    } else if (post?.status === 'draft') {
      setStats(prev => ({ ...prev, draft: prev.draft - 1 }));
    } else if (post?.status === 'archived') {
      setStats(prev => ({ ...prev, archived: prev.archived - 1 }));
    }
  };

  return {
    posts,
    stats,
    loading,
    error,
    refetch: fetchAll,
    createPost,
    updatePost,
    publishPost,
    unpublishPost,
    archivePost,
    deletePost,
  };
}
