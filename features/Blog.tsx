import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { User, Plus, X, Mail } from 'lucide-react';
import { User as UserType, BlogPost, Comment } from '../types';
import { db } from '../lib/mockDb';

// Modular Components
import { BlogList } from './blog/components/BlogList';
import { BlogPostView } from './blog/components/BlogPost';
import { Editor } from './blog/components/BlogEditor';

export const BlogSection = () => {
  const [mode, setMode] = useState<'LIST' | 'READ' | 'EDIT'>('LIST');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortMode, setSortMode] = useState<'LATEST' | 'POPULAR'>('LATEST');

  useEffect(() => refreshPosts(), []);
  const refreshPosts = () => {
    setIsLoading(true);
    setTimeout(() => { setPosts(db.getPosts()); setIsLoading(false); }, 600);
  };

  const handleLogin = () => setUser(prev => prev ? null : { name: 'Prince Jona', email: 'jona@intervised.com', isAdmin: true, avatar: 'https://picsum.photos/100' });
  const navigateToRead = (post: BlogPost) => { db.incrementViews(post.id); setActivePost({ ...post, views: (post.views || 0) + 1 }); setMode('READ'); window.scrollTo(0, 0); };
  const navigateToEdit = (post?: BlogPost) => { setActivePost(post || null); setMode('EDIT'); };
  const navigateToList = () => { setMode('LIST'); setActivePost(null); refreshPosts(); };
  
  const handleLike = () => { if (activePost) { db.toggleLike(activePost.id); setActivePost(prev => prev ? ({ ...prev, likes: prev.likes + 1 }) : null); } };
  const handleAddComment = (comment: Comment) => { if (activePost) { db.addComment(activePost.id, comment); setActivePost(prev => prev ? ({ ...prev, comments: [comment, ...prev.comments] }) : null); } };

  const visiblePosts = posts.filter(p => {
    const query = searchQuery.toLowerCase();
    return (p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query) || p.tags.some(tag => tag.toLowerCase().includes(query))) &&
           (activeCategory === 'All' || p.category === activeCategory) && (user?.isAdmin || p.status === 'published');
  }).sort((a, b) => sortMode === 'LATEST' ? b.timestamp - a.timestamp : b.views - a.views);

  return (
    <section className="min-h-screen pt-20 sm:pt-24 pb-32 px-4 sm:px-6 max-w-[1400px] mx-auto text-gray-200 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-white/10 pb-8">
        <div><h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-2 text-white">JOURNAL</h2><p className="text-accent text-sm font-mono tracking-widest uppercase">Insights for the Modern Creative</p></div>
        <div className="flex items-center gap-4">
          {!user ? (
            <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-xs font-mono uppercase tracking-widest text-gray-400"><User size={14} /> Contributor Login</button>
          ) : (
            <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-full border border-white/10">
              <img src={user.avatar} className="w-8 h-8 rounded-full border border-accent" alt="avatar" />
              <button onClick={() => navigateToEdit()} className="p-2 bg-accent rounded-full hover:bg-white transition-colors text-void" title="New Post"><Plus size={16} /></button>
              <button onClick={handleLogin} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'LIST' && (
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
        
        {mode === 'READ' && activePost && (
           <BlogPostView 
             post={activePost} 
             user={user} 
             onBack={navigateToList} 
             onEdit={navigateToEdit} 
             onLike={handleLike} 
             onAddComment={handleAddComment}
             relatedPosts={posts.filter(p => p.id !== activePost.id && (p.category === activePost.category || p.tags.some(t => activePost.tags.includes(t)))).slice(0, 3)}
             onNavigate={navigateToRead}
           />
        )}

        {mode === 'EDIT' && (
          <Editor 
            initialPost={activePost || undefined} 
            onCancel={() => activePost ? navigateToRead(activePost) : navigateToList()}
            onSave={(post) => { db.savePost(post); refreshPosts(); navigateToRead(post); }}
            currentUser={user}
            categories={['Creative', 'Tech', 'Ministry', 'Strategy']}
          />
        )}
      </AnimatePresence>

      {/* Newsletter (Always visible at bottom in list mode) */}
      {mode === 'LIST' && (
         <div className="my-20 p-10 rounded-3xl bg-gradient-to-br from-secondary/20 to-void border border-accent/20 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Mail size={120} /></div>
            <div className="relative z-10 max-w-xl mx-auto">
               <span className="text-accent font-mono text-xs uppercase tracking-widest mb-4 block">Intelligence Briefing</span>
               <h3 className="text-3xl font-display font-bold mb-4 text-white">Join the Frequency</h3>
               <p className="text-gray-400 mb-8 text-lg leading-relaxed">Receive weekly transmissions on the theology of technology, creative systems, and ministry strategy.</p>
               <div className="flex flex-col sm:flex-row gap-3">
                  <input type="email" placeholder="enter@your.email" className="flex-1 bg-black/40 border border-white/20 rounded-xl px-5 py-4 focus:outline-none focus:border-accent transition-colors" />
                  <button className="bg-accent text-void font-bold px-8 py-4 rounded-xl hover:bg-white transition-colors">Subscribe</button>
               </div>
            </div>
         </div>
      )}
    </section>
  );
};