import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, List, Heart, MessageCircle, Edit3, Share2, Calendar, Clock, TrendingUp, Link, Twitter, Linkedin, Check, X } from 'lucide-react';
import { BlogPost, Comment, User } from '../../../types';
import { useToast } from '../../../components/ToastSystem';

// Modular Sub-Components
import { MarkdownRenderer } from './reader/MarkdownRenderer';
import { TableOfContents } from './reader/TableOfContents';
import { CommentSection } from './reader/CommentSection';
import { AuthorBio } from './reader/AuthorBio';
import { BlogSEO } from './BlogSEO';

interface BlogPostViewProps {
   post: BlogPost;
   user: User | null;
   onBack: () => void;
   onEdit: (post: BlogPost) => void;
   onLike: () => void;
   onAddComment: (comment: Comment) => void;
   relatedPosts: BlogPost[];
   onNavigate: (post: BlogPost) => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({
   post, user, onBack, onEdit, onLike, onAddComment, relatedPosts, onNavigate
}) => {
   const { addToast } = useToast();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [shareOpen, setShareOpen] = useState(false);
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

   useEffect(() => {
      const originalTitle = document.title;
      document.title = `${post.title} | Intervised Blog`;
      return () => { document.title = originalTitle; };
   }, [post]);

   const handleCopyLink = () => {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard', 'success');
      setShareOpen(false);
   };

   const handleShareTwitter = () => {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(post.title);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
      setShareOpen(false);
   };

   const handleShareLinkedIn = () => {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
      setShareOpen(false);
   };

   return (
      <motion.div key="read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
         {/* SEO: Article structured data + meta tags */}
         <BlogSEO
            title={post.title}
            description={post.excerpt || post.content.substring(0, 160)}
            slug={post.slug}
            author={post.author}
            publishedAt={post.date}
            imageUrl={post.imageUrl}
            tags={post.tags}
            category={post.category}
         />
         {/* Nav Bar specific to Read Mode (Mobile Only) */}
         <div className="sticky top-0 z-40 bg-void/90 backdrop-blur-xl border-b border-white/10 py-3 -mx-4 px-4 mb-6 flex justify-between items-center lg:hidden shadow-xl">
            <button onClick={onBack} className="text-gray-300 hover:text-white flex items-center gap-2 text-sm font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><ArrowLeft size={16} /> Back</button>
            <div className="flex gap-2">
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold"><List size={16} /> Contents</button>
               <button onClick={onLike} className="text-gray-300 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-bold"><Heart size={16} className={post.likes > 0 ? "fill-red-400 text-red-400" : ""} /> {post.likes}</button>
            </div>
         </div>

         {/* Mobile TOC Drawer Slide-in */}
         <AnimatePresence>
            {mobileMenuOpen && (
               <>
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setMobileMenuOpen(false)}
                     className="fixed inset-0 bg-black/80 z-50 lg:hidden backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ x: '-100%' }}
                     animate={{ x: 0 }}
                     exit={{ x: '-100%' }}
                     transition={{ type: "spring", damping: 25, stiffness: 200 }}
                     className="fixed inset-y-0 left-0 z-50 w-80 bg-[#001428] border-r border-white/10 shadow-2xl lg:hidden flex flex-col"
                  >
                     <div className="p-6 border-b border-white/10 flex justify-between items-center bg-void/50">
                        <h3 className="font-display font-bold text-lg text-white">Navigation</h3>
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><X size={20} /></button>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <TableOfContents content={post.content} isMobile onItemClick={() => setMobileMenuOpen(false)} />
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>

         <button onClick={onBack} className="hidden lg:flex group items-center gap-2 text-sm text-gray-500 hover:text-accent mb-8 transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Journal
         </button>

         <motion.div layoutId={`post-${post.id}`} className="relative mb-12">
            {/* Header Image */}
            <motion.div layoutId={`img-${post.id}`} className="w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 border border-white/10 shadow-2xl relative">
               <img src={post.imageUrl} alt={post.title} width={1200} height={600} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
               <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full max-w-5xl">
                  <div className="flex gap-2 mb-2 sm:mb-4"><span className="bg-accent text-void px-2 py-1 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-widest">{post.category}</span></div>
                  <h1 className="text-2xl sm:text-3xl md:text-6xl font-display font-bold leading-tight mb-4 sm:mb-6 text-white drop-shadow-lg">{post.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-mono text-gray-300 uppercase tracking-widest">
                     <div className="flex items-center gap-2"><div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700 overflow-hidden border border-white/20"><img src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} alt={post.author} width={32} height={32} /></div><span className="font-bold text-white">{post.author}</span></div>
                     <span className="opacity-60 hidden sm:inline">|</span><span className="flex items-center gap-2 opacity-80"><Calendar size={14} /> {post.date}</span><span className="flex items-center gap-2 opacity-80"><Clock size={14} /> {post.readTime} MIN READ</span>
                  </div>
               </div>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8 xl:gap-16 relative max-w-7xl mx-auto items-start">
               {/* LEFT: Content */}
               <motion.div
                  layout
                  className={`flex-1 w-full transition-all duration-500 ${sidebarCollapsed ? 'lg:max-w-5xl' : 'lg:max-w-3xl'}`}
               >
                  <div className="flex items-center justify-between py-4 border-b border-white/10 mb-8 overflow-x-auto">
                     <div className="flex gap-4">
                        <button onClick={onLike} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors group"><Heart size={20} className={post.likes > 0 ? "fill-red-400 text-red-400" : "group-hover:scale-110 transition-transform"} /><span className="text-sm font-bold whitespace-nowrap">{post.likes} Likes</span></button>
                        <button onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors"><MessageCircle size={20} /><span className="text-sm font-bold whitespace-nowrap">{post.comments.length} Comments</span></button>
                     </div>
                     <div className="flex gap-2 relative ml-4">
                        {user?.isAdmin && <button onClick={() => onEdit(post)} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Edit"><Edit3 size={18} /></button>}
                        <div className="relative">
                           <button onClick={() => setShareOpen(!shareOpen)} className={`p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white ${shareOpen ? 'bg-white/10 text-white' : ''}`} title="Share"><Share2 size={18} /></button>
                           <AnimatePresence>
                              {shareOpen && (
                                 <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 p-1 backdrop-blur-xl"
                                 >
                                    <button onClick={handleCopyLink} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                                       <Link size={14} /> Copy Link
                                    </button>
                                    <button onClick={handleShareTwitter} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                                       <Twitter size={14} /> Twitter
                                    </button>
                                    <button onClick={handleShareLinkedIn} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                                       <Linkedin size={14} /> LinkedIn
                                    </button>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </div>
                  </div>
                  <MarkdownRenderer content={post.content} />
                  <AuthorBio post={post} />

                  {relatedPosts.length > 0 && (
                     <div className="my-12 border-t border-white/10 pt-10">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                              <TrendingUp size={20} className="text-accent" /> Related Transmissions
                           </h3>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
                           {relatedPosts.map(rp => (
                              <div
                                 key={rp.id}
                                 onClick={() => onNavigate(rp)}
                                 className="min-w-[260px] w-[260px] sm:min-w-[280px] sm:w-[280px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-accent/50 transition-all flex-shrink-0 snap-center group"
                              >
                                 <div className="aspect-video relative overflow-hidden">
                                    <img src={rp.imageUrl} alt={rp.title} width={280} height={158} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white uppercase border border-white/10">{rp.category}</div>
                                 </div>
                                 <div className="p-4">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-accent uppercase tracking-widest mb-2">
                                       <Calendar size={12} /> {rp.date}
                                    </div>
                                    <h4 className="font-bold text-white text-base leading-tight mb-2 line-clamp-2 group-hover:text-accent transition-colors">{rp.title}</h4>
                                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{rp.excerpt}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <div id="comments"><CommentSection post={post} onAddComment={onAddComment} /></div>
               </motion.div>

               {/* RIGHT: Sidebar (Desktop) */}
               <motion.div
                  layout
                  className={`hidden lg:block h-fit sticky top-32 transition-all duration-500 ${sidebarCollapsed ? 'w-16' : 'w-80'}`}
               >
                  <div className="space-y-8">
                     <TableOfContents
                        content={post.content}
                        collapsed={sidebarCollapsed}
                        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                     />

                     {!sidebarCollapsed && relatedPosts.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                           <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-6 flex items-center gap-2"><TrendingUp size={14} /> Related</h4>
                           <div className="space-y-6">
                              {relatedPosts.map(rp => (
                                 <div key={rp.id} onClick={() => onNavigate(rp)} className="group cursor-pointer">
                                    <div className="aspect-video rounded-xl overflow-hidden mb-3 relative border border-white/10"><img src={rp.imageUrl} width={320} height={180} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rp.title} /></div>
                                    <h5 className="font-bold text-white text-base leading-tight group-hover:text-accent transition-colors mb-1">{rp.title}</h5>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{rp.category}</span>
                                 </div>
                              ))}
                           </div>
                        </motion.div>
                     )}
                  </div>
               </motion.div>
            </div>
         </motion.div>
      </motion.div>
   );
};