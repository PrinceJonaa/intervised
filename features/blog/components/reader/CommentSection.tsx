import React, { useState } from 'react';
import { MessageCircle, Send, ThumbsUp, ThumbsDown, Flag, AlertTriangle, MoreVertical, X } from 'lucide-react';
import { BlogPost, Comment } from '../../../../types';
import { blogService } from '../../../../lib/supabase/blogService';
import { authService } from '../../../../lib/supabase/authService';
import { profileService } from '../../../../lib/supabase/profileService';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const CommentSection = ({ post, onAddComment }: { post: BlogPost, onAddComment: (comment: Comment) => void }) => {
   const [newComment, setNewComment] = useState('');
   const [name, setName] = useState('');
   const [voting, setVoting] = useState<Record<string, 'up' | 'down' | null>>({});
   const [reporting, setReporting] = useState<string | null>(null);
   const [reportReason, setReportReason] = useState('spam');

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      const user = await authService.getCurrentUser();
      const authorName = user ? (user.user_metadata.full_name || user.email?.split('@')[0] || 'Anonymous') : name;
      const avatar = user ? (user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${authorName}&background=random`) : `https://ui-avatars.com/api/?name=${authorName}&background=random`;

      onAddComment({
         id: Date.now().toString(),
         author: authorName,
         content: newComment,
         date: Date.now(),
         avatar,
         user_id: user?.id,
         upvotes: 0,
         downvotes: 0
      });
      setNewComment('');
   };

   const handleVote = async (commentId: string, type: 'up' | 'down') => {
      try {
         const user = await authService.getCurrentUser();
         if (!user) {
            alert('Please login to vote');
            return;
         }

         // Optimistic update would happen here in a real app or trigger a re-fetch
         setVoting(prev => ({ ...prev, [commentId]: type }));
         await blogService.voteComment(commentId, type);
      } catch (err) {
         console.error('Vote failed:', err);
         setVoting(prev => ({ ...prev, [commentId]: null }));
      }
   };

   const handleReport = async (commentId: string) => {
      try {
         const user = await authService.getUser();
         if (!user) {
            alert('Please login to report content');
            return;
         }

         await blogService.reportContent('comment', commentId, reportReason as any);
         setReporting(null);
         alert('Report submitted. Thank you for helping keep our community safe.');
      } catch (err) {
         console.error('Report failed:', err);
         alert('Failed to submit report');
      }
   };

   return (
      <div className="mt-20 pt-16 border-t border-white/10">
         <h3 className="text-3xl font-display font-bold mb-10 flex items-center gap-3">
            Discussion <span className="bg-accent text-void text-xs sm:text-sm px-3 py-1 rounded-full font-bold font-mono">{post.comments ? post.comments.length : 0}</span>
         </h3>

         <form onSubmit={handleSubmit} className="mb-16 bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <h4 className="text-sm font-bold text-gray-300 mb-6 uppercase tracking-wide flex items-center gap-2">
               <MessageCircle size={16} /> Join the Conversation
            </h4>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
               <input
                  type="text"
                  placeholder="Your Name (Optional if logged in)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl p-4 w-full sm:w-1/3 text-sm focus:border-accent outline-none transition-colors"
               />
            </div>
            <textarea
               value={newComment}
               onChange={(e) => setNewComment(e.target.value)}
               placeholder="What are your thoughts?"
               className="w-full bg-black/40 border border-white/10 rounded-xl p-5 h-32 text-sm focus:border-accent outline-none resize-none mb-6 transition-colors"
            />
            <div className="flex justify-end">
               <button type="submit" className="bg-accent text-void font-bold px-8 py-3 rounded-full hover:bg-white transition-colors text-sm flex items-center gap-2">
                  Post Comment <Send size={14} />
               </button>
            </div>
         </form>

         <div className="space-y-8">
            {(!post.comments || post.comments.length === 0) ? (
               <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                  <MessageCircle className="mx-auto mb-3 text-gray-600" size={32} />
                  <p className="text-gray-500 italic">No signals detected yet. Be the first to transmit.</p>
               </div>
            ) : (
               post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-4 sm:gap-5 animate-fadeIn group">
                     {comment.user_id ? (
                        <Link to={`/user/${comment.user_id}`}>
                           <img src={comment.avatar} alt={comment.author} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 hover:border-accent transition-colors" />
                        </Link>
                     ) : (
                        <img src={comment.avatar} alt={comment.author} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10" />
                     )}

                     <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                              {comment.user_id ? (
                                 <Link to={`/user/${comment.user_id}`} className="font-bold text-white text-base hover:text-accent transition-colors">
                                    {comment.author}
                                 </Link>
                              ) : (
                                 <span className="font-bold text-white text-base">{comment.author}</span>
                              )}
                              <span className="text-xs text-gray-500 font-mono">• {new Date(comment.date).toLocaleDateString()}</span>
                           </div>

                           <button
                              onClick={() => setReporting(reporting === comment.id ? null : comment.id)}
                              className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                              title="Report"
                           >
                              <Flag size={14} />
                           </button>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl rounded-tl-none border border-white/5 relative">
                           <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                           {/* Voting & Actions */}
                           <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
                              <button
                                 onClick={() => handleVote(comment.id, 'up')}
                                 className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${voting[comment.id] === 'up' ? 'text-accent' : 'text-gray-500 hover:text-white'}`}
                              >
                                 <ThumbsUp size={14} className={voting[comment.id] === 'up' ? 'fill-accent' : ''} />
                                 <span>{comment.upvotes || 0}</span>
                              </button>

                              <button
                                 onClick={() => handleVote(comment.id, 'down')}
                                 className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${voting[comment.id] === 'down' ? 'text-red-400' : 'text-gray-500 hover:text-white'}`}
                              >
                                 <ThumbsDown size={14} className={voting[comment.id] === 'down' ? 'fill-red-400' : ''} />
                                 <span>{comment.downvotes || 0}</span>
                              </button>

                              <button className="text-xs text-gray-500 hover:text-white ml-auto">
                                 Reply
                              </button>
                           </div>
                        </div>

                        {/* Report Modal (Inline) */}
                        <AnimatePresence>
                           {reporting === comment.id && (
                              <motion.div
                                 initial={{ opacity: 0, height: 0 }}
                                 animate={{ opacity: 1, height: 'auto' }}
                                 exit={{ opacity: 0, height: 0 }}
                                 className="mt-2 bg-red-900/20 border border-red-500/20 rounded-lg p-3 overflow-hidden"
                              >
                                 <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-xs font-bold text-red-400 flex items-center gap-1">
                                       <AlertTriangle size={12} /> Report Content
                                    </h5>
                                    <button onClick={() => setReporting(null)} className="text-gray-500 hover:text-white">
                                       <X size={14} />
                                    </button>
                                 </div>
                                 <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white mb-2 outline-none focus:border-red-500/50"
                                 >
                                    <option value="spam">Spam</option>
                                    <option value="abuse">Abusive or Harmful</option>
                                    <option value="harassment">Harassment</option>
                                    <option value="misinformation">Misinformation</option>
                                    <option value="other">Other</option>
                                 </select>
                                 <button
                                    onClick={() => handleReport(comment.id)}
                                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs py-1.5 rounded transition-colors font-medium"
                                 >
                                    Submit Report
                                 </button>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
};