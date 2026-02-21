import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { User, Plus, X, Mail, Loader2 } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { User as UserType, BlogPost, Comment } from '../types';
import { useBlogPosts, useBlogPost } from '../hooks/useBlog';
import { BlogPost as SupabaseBlogPost } from '../lib/supabase/blogService';
import { useAuthContext } from '../components/AuthProvider';

// Modular Components
import { BlogList } from './blog/components/BlogList';
import { BlogPostView } from './blog/components/BlogPost';
import { Editor } from './blog/components/BlogEditor';

// Transform Supabase post to legacy format for compatibility
const transformPost = (post: SupabaseBlogPost): BlogPost => ({
  id: post.id,
  slug: post.slug,
  title: post.title,
  content: post.content,
  excerpt: post.excerpt || '',
  category: post.category || 'Tech',
  tags: post.tags || [],
  author: post.author_name || 'Anonymous',
  authorRole: post.author_role || '',
  date: formatDate(post.published_at || post.created_at || new Date().toISOString()),
  publishedAtISO: post.published_at || post.created_at || undefined,
  updatedAtISO: post.updated_at || post.published_at || post.created_at || undefined,
  timestamp: new Date(post.published_at || post.created_at || Date.now()).getTime(),
  lastModified: new Date(post.updated_at || post.created_at || Date.now()).getTime(),
  readTime: post.read_time || 5,
  views: post.views || 0,
  likes: post.likes || 0,
  comments: [],
  status: (post.status || 'draft') as 'draft' | 'published',
  imageUrl: post.featured_image || 'https://picsum.photos/800/400?grayscale',
  metaDescription: post.meta_description || '',
  keywords: post.meta_keywords || []
});

// Helper to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
};

export const BlogSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const { user: authUser, profile, isAdmin, signOut, isAuthenticated } = useAuthContext();

  const [mode, setMode] = useState<'LIST' | 'READ' | 'EDIT'>(routeSlug ? 'READ' : 'LIST');
  const [activePostSlug, setActivePostSlug] = useState<string | null>(routeSlug || null);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortMode, setSortMode] = useState<'LATEST' | 'POPULAR'>('LATEST');

  // Map auth context to legacy user format
  const user: UserType | null = isAuthenticated && authUser ? {
    name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    isAdmin: isAdmin,
    avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${authUser.email}`
  } : null;

  // Use Supabase hooks - Keep category case as-is (DB enum is capitalized)
  const categoryFilter = activeCategory === 'All' ? undefined : activeCategory as any;
  const { posts: supabasePosts, isLoading, error, refetch } = useBlogPosts({
    category: categoryFilter
  });

  // Transform posts for legacy components (handle errors gracefully)
  const posts = useMemo(() => {
    if (error) {
      console.error('Blog posts fetch error:', error);
      return [];
    }
    return supabasePosts.map(transformPost);
  }, [supabasePosts, error]);

  // Keep blog UI state synced with URL so /blog/:slug pages are crawlable and shareable.
  useEffect(() => {
    if (routeSlug) {
      setMode('READ');
      setActivePostSlug(routeSlug);
      return;
    }

    setActivePostSlug(null);
    setMode((prev) => (prev === 'EDIT' ? prev : 'LIST'));
  }, [routeSlug]);

  const handleLogin = async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/login');
    }
  };

  const navigateToRead = (post: BlogPost) => {
    if (post.slug) {
      setActivePostSlug(post.slug);
      setMode('READ');
      navigate(`/blog/${post.slug}`);
      window.scrollTo(0, 0);
    }
  };

  const navigateToEdit = (post?: BlogPost) => {
    if (location.pathname !== '/blog') {
      navigate('/blog');
    }
    setActivePostSlug(post?.slug || null);
    setMode('EDIT');
  };

  const navigateToList = () => {
    setMode('LIST');
    setActivePostSlug(null);
    if (location.pathname !== '/blog') {
      navigate('/blog');
    }
    refetch();
  };

  // Filter and sort posts
  const visiblePosts = useMemo(() => {
    return posts.filter(p => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query));
      const matchesStatus = user?.isAdmin || p.status === 'published';
      return matchesSearch && matchesStatus;
    }).sort((a, b) => sortMode === 'LATEST' ? b.timestamp - a.timestamp : b.views - a.views);
  }, [posts, searchQuery, user?.isAdmin, sortMode]);

  return (
    <section className="min-h-screen-safe pt-20 md:pt-24 pb-32 px-4 sm:px-6 max-w-[1400px] mx-auto text-gray-200 relative safe-bottom">

      {/* Header - mobile-optimized */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4 md:gap-6 border-b border-white/10 pb-6 md:pb-8">
        <div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-1 md:mb-2 text-white">JOURNAL</h2>
          <p className="text-accent text-xs md:text-sm font-mono tracking-widest uppercase">Insights for the Modern Creative</p>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {!user ? (
            <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-xs font-mono uppercase tracking-widest text-gray-400 touch-target"><User size={14} /> Login</button>
          ) : (
            <div className="flex items-center gap-2 md:gap-3 bg-white/5 p-1.5 rounded-full border border-white/10">
              <img src={user.avatar} width={32} height={32} className="w-8 h-8 rounded-full border border-accent" alt="avatar" />
              <button onClick={() => navigateToEdit()} className="p-2.5 bg-accent rounded-full hover:bg-white transition-colors text-void touch-target" title="New Post"><Plus size={16} /></button>
              <button onClick={handleLogin} className="p-2.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors touch-target"><X size={16} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">Failed to load posts: {error}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-accent text-void rounded-lg">Retry</button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {mode === 'LIST' && !error && (
          <BlogList
            isLoading={isLoading}
            posts={visiblePosts}
            categories={['All', 'Creative', 'Tech', 'Ministry', 'Strategy']}
            activeCategory={activeCategory} setActiveCategory={setActiveCategory}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            sortMode={sortMode} setSortMode={setSortMode}
            onRead={navigateToRead}
            featuredPost={visiblePosts[0]}
          />
        )}

        {mode === 'READ' && activePostSlug && (
          <BlogPostReader
            slug={activePostSlug}
            user={user}
            onBack={navigateToList}
            onEdit={navigateToEdit}
            relatedPosts={visiblePosts}
            onNavigate={navigateToRead}
          />
        )}

        {mode === 'EDIT' && (
          <BlogPostEditor
            slug={activePostSlug}
            user={user}
            onCancel={navigateToList}
            onSave={navigateToList}
          />
        )}
      </AnimatePresence>

      {/* Newsletter (Always visible at bottom in list mode) */}
      {mode === 'LIST' && (
        <NewsletterSection />
      )}
    </section>
  );
};

// Blog Post Reader Component - uses useBlogPost hook
const BlogPostReader: React.FC<{
  slug: string;
  user: UserType | null;
  onBack: () => void;
  onEdit: (post?: BlogPost) => void;
  relatedPosts: BlogPost[];
  onNavigate: (post: BlogPost) => void;
}> = ({ slug, user, onBack, onEdit, relatedPosts, onNavigate }) => {
  const { post, comments, isLoading, addComment, toggleLike } = useBlogPost(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-400">Post not found</p>
        <button onClick={onBack} className="mt-4 text-accent hover:underline">Back to list</button>
      </div>
    );
  }

  const transformedPost = transformPost(post);

  // Transform comments to legacy format
  transformedPost.comments = comments.map(c => ({
    id: c.id,
    author: c.author_name,
    avatar: c.author_avatar || 'https://picsum.photos/100',
    text: c.content,
    timestamp: new Date(c.created_at).getTime()
  }));

  const handleLike = async () => {
    if (user) {
      await toggleLike(user.email);
    }
  };

  const handleAddComment = async (comment: Comment) => {
    await addComment({
      content: comment.text,
      author_name: comment.author,
      author_avatar: comment.avatar,
      author_id: user?.email
    });
  };

  // Get related posts (same category or shared tags)
  const related = relatedPosts
    .filter(p => p.id !== post.id && (
      p.category === transformedPost.category ||
      p.tags.some(t => transformedPost.tags.includes(t))
    ))
    .slice(0, 3);

  return (
    <BlogPostView
      post={transformedPost}
      user={user}
      onBack={onBack}
      onEdit={() => onEdit(transformedPost)}
      onLike={handleLike}
      onAddComment={handleAddComment}
      relatedPosts={related}
      onNavigate={onNavigate}
    />
  );
};

// Blog Post Editor Component
const BlogPostEditor: React.FC<{
  slug: string | null;
  user: UserType | null;
  onCancel: () => void;
  onSave: () => void;
}> = ({ slug, user, onCancel, onSave }) => {
  const { post, isLoading } = useBlogPost(slug || '');
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading && slug) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const handleSave = async (postData: BlogPost) => {
    setIsSaving(true);
    try {
      if (post) {
        // Update existing post
        await blogService.updatePost(post.id, {
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt,
          category: postData.category.toLowerCase() as any,
          tags: postData.tags,
          featured_image: postData.image,
          status: postData.status as 'draft' | 'published'
        });
      } else {
        // Create new post
        await blogService.createPost({
          title: postData.title,
          slug: blogService.generateSlug(postData.title),
          content: postData.content,
          excerpt: postData.excerpt,
          category: postData.category.toLowerCase() as any,
          tags: postData.tags,
          featured_image: postData.image,
          status: postData.status as 'draft' | 'published',
          author_id: user?.email || undefined,
          author_name: user?.name || 'Anonymous',
          author_avatar: user?.avatar
        });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const initialPost = post ? transformPost(post) : undefined;

  return (
    <Editor
      initialPost={initialPost}
      onCancel={onCancel}
      onSave={handleSave}
      currentUser={user}
      categories={['Creative', 'Tech', 'Ministry', 'Strategy']}
    />
  );
};

// Newsletter Section Component
const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          // Duplicate email
          setStatus('success');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
      }
      setEmail('');
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      setStatus('error');
    }
  };

  return (
    <div className="my-12 md:my-20 p-6 md:p-10 rounded-2xl md:rounded-3xl bg-gradient-to-br from-secondary/20 to-void border border-accent/20 text-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10"><Mail size={80} /></div>
      <div className="relative z-10 max-w-xl mx-auto">
        <span className="text-accent font-mono text-[10px] md:text-xs uppercase tracking-widest mb-3 md:mb-4 block">Intelligence Briefing</span>
        <h3 className="text-2xl md:text-3xl font-display font-bold mb-3 md:mb-4 text-white">Join the Frequency</h3>
        <p className="text-gray-400 mb-6 md:mb-8 text-sm md:text-lg leading-relaxed">Receive weekly transmissions on the theology of technology, creative systems, and ministry strategy.</p>

        {status === 'success' ? (
          <p className="text-accent text-base md:text-lg">✓ You're now subscribed!</p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enter@your.email"
              className="w-full bg-black/40 border border-white/20 rounded-xl px-4 md:px-5 py-3 md:py-4 focus:outline-none focus:border-accent transition-colors text-base"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto bg-accent text-void font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-50 touch-target"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-red-400 mt-4">Failed to subscribe. Please try again.</p>
        )}
      </div>
    </div>
  );
};
