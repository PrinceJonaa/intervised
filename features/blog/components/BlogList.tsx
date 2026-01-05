
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Flame, Calendar, Eye, Heart, User, Filter, X } from 'lucide-react';
import { BlogPost, User as UserType } from '../../../types';
import { BlogSkeleton } from '../../../components/Loading';

interface BlogListProps {
  isLoading: boolean;
  posts: BlogPost[];
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortMode: 'LATEST' | 'POPULAR';
  setSortMode: (m: 'LATEST' | 'POPULAR') => void;
  onRead: (post: BlogPost) => void;
  featuredPost?: BlogPost;
}

export const BlogList: React.FC<BlogListProps> = ({ 
  isLoading, posts, categories, activeCategory, setActiveCategory,
  searchQuery, setSearchQuery, sortMode, setSortMode, onRead, featuredPost
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const gridPosts = featuredPost && sortMode === 'LATEST' && activeCategory === 'All' && !searchQuery ? posts.slice(1) : posts;

  return (
    <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      {/* Filters & Search - Sticky Header */}
      <div className="sticky top-[58px] lg:top-24 z-30 -mx-4 px-4 mb-8 transition-all duration-300">
        {/* Glass Background - Reduced opacity for better see-through effect */}
        <div className="absolute inset-0 bg-[#001428]/60 backdrop-blur-md border-b border-white/10 shadow-lg" />
        
        <div className="relative py-2 lg:py-4 flex flex-col gap-2">
            {/* Mobile Header Line with Toggle */}
            <div className="flex lg:hidden items-center justify-between h-10">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                        <Filter size={12} />
                        {activeCategory}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">/ {gridPosts.length} Signals</span>
                </div>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border ${showFilters ? 'bg-white/10 text-white border-white/20' : 'text-gray-400 hover:text-white border-transparent'}`}
                >
                    {showFilters ? <><X size={14}/> Close</> : <><Search size={14}/> Filter</>}
                </button>
            </div>

            {/* Filter Content - Collapsible on Mobile, Visible on Desktop */}
            <motion.div 
                initial={false}
                animate={{ 
                    height: showFilters ? 'auto' : 0,
                    opacity: showFilters ? 1 : 0,
                    marginBottom: showFilters ? 8 : 0
                }}
                className={`overflow-hidden flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:!h-auto lg:!opacity-100 lg:!mb-0`}
            >
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto w-full lg:w-auto scrollbar-hide pb-1 lg:pb-0 pt-2 lg:pt-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border ${activeCategory === cat ? 'bg-accent text-void border-accent' : 'bg-white/5 text-gray-400 border-transparent hover:border-white/20 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                
                {/* Search & Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto pb-2 lg:pb-0">
                    <div className="flex bg-white/5 rounded-lg border border-white/10 p-1 flex-shrink-0 self-start sm:self-auto w-full sm:w-auto">
                        <button onClick={() => setSortMode('LATEST')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${sortMode === 'LATEST' ? 'bg-white/10 text-white shadow' : 'text-gray-500'}`}><Clock size={12}/> Latest</button>
                        <button onClick={() => setSortMode('POPULAR')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${sortMode === 'POPULAR' ? 'bg-white/10 text-white shadow' : 'text-gray-500'}`}><Flame size={12}/> Popular</button>
                    </div>
                    <div className="relative flex-1 group w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-accent transition-colors" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search archive..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-accent transition-all placeholder:text-gray-600 h-full"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <BlogSkeleton key={i} />)}
         </div>
      ) : posts.length === 0 ? (
         <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5">
            <Search className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg">No transmissions found.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-4 text-accent hover:underline">Reset Filters</button>
         </div>
      ) : (
         <div className="space-y-12">
            {/* HERO POST (Latest) */}
            {featuredPost && sortMode === 'LATEST' && activeCategory === 'All' && !searchQuery && (
               <motion.article 
                  layoutId={`post-${featuredPost.id}`}
                  onClick={() => onRead(featuredPost)}
                  className="group relative w-full aspect-[4/5] sm:aspect-[4/3] md:aspect-[21/9] rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-white/10"
               >
                  <motion.img layoutId={`img-${featuredPost.id}`} src={featuredPost.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={featuredPost.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 md:p-12 max-w-4xl">
                     <span className="inline-block px-3 py-1 bg-accent text-void text-xs font-bold uppercase tracking-widest rounded mb-4">Featured Signal</span>
                     <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight group-hover:text-accent transition-colors">{featuredPost.title}</h2>
                     <p className="text-gray-300 text-sm sm:text-lg md:text-xl line-clamp-2 max-w-2xl mb-6 hidden sm:block">{featuredPost.excerpt}</p>
                     <div className="flex items-center gap-6 text-xs font-mono text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><img src={`https://ui-avatars.com/api/?name=${featuredPost.author}&background=random`} className="w-6 h-6 rounded-full" alt="author"/> {featuredPost.author}</span>
                        <span className="flex items-center gap-2"><Clock size={14}/> {featuredPost.readTime} MIN READ</span>
                     </div>
                  </div>
               </motion.article>
            )}

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
               {gridPosts.map((post, idx) => (
                  <motion.article 
                     key={post.id}
                     layoutId={`post-${post.id}`}
                     onClick={() => onRead(post)}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     className="group flex flex-col bg-white/5 border border-white/5 hover:border-accent/50 rounded-2xl overflow-hidden transition-all hover:bg-white/10 cursor-pointer hover:shadow-xl hover:-translate-y-1"
                  >
                     <div className="aspect-video overflow-hidden relative">
                        <motion.img layoutId={`img-${post.id}`} src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white uppercase border border-white/10">
                           {post.category}
                        </div>
                     </div>
                     <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-accent text-xs font-mono uppercase tracking-widest mb-3">
                           <Calendar size={12} /> {post.date}
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-3 leading-snug group-hover:text-accent transition-colors">{post.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">{post.excerpt}</p>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                           <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="font-bold text-white">{post.author}</span>
                           </div>
                           <div className="flex gap-3 text-gray-500 text-xs">
                              <span className="flex items-center gap-1"><Eye size={12}/> {post.views}</span>
                              <span className="flex items-center gap-1"><Heart size={12}/> {post.likes}</span>
                           </div>
                        </div>
                     </div>
                  </motion.article>
               ))}
            </div>
         </div>
      )}
    </motion.div>
  );
};
