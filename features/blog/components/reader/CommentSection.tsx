import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { BlogPost, Comment } from '../../../../types';

export const CommentSection = ({ post, onAddComment }: { post: BlogPost, onAddComment: (comment: Comment) => void }) => {
   const [newComment, setNewComment] = useState('');
   const [name, setName] = useState('');

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !name.trim()) return;
      onAddComment({ id: Date.now().toString(), author: name, content: newComment, date: Date.now(), avatar: `https://ui-avatars.com/api/?name=${name}&background=random` });
      setNewComment('');
   };

   return (
      <div className="mt-20 pt-16 border-t border-white/10">
         <h3 className="text-3xl font-display font-bold mb-10 flex items-center gap-3">Discussion <span className="bg-accent text-void text-sm px-3 py-1 rounded-full font-bold font-mono">{post.comments.length}</span></h3>
         
         <form onSubmit={handleSubmit} className="mb-16 bg-white/5 p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <h4 className="text-sm font-bold text-gray-300 mb-6 uppercase tracking-wide flex items-center gap-2"><MessageCircle size={16}/> Join the Conversation</h4>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
               <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-4 w-full sm:w-1/3 text-sm focus:border-accent outline-none transition-colors" />
               <input type="text" placeholder="Email (private)" className="bg-black/40 border border-white/10 rounded-xl p-4 w-full sm:w-2/3 text-sm focus:border-accent outline-none transition-colors" />
            </div>
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="What are your thoughts?" className="w-full bg-black/40 border border-white/10 rounded-xl p-5 h-32 text-sm focus:border-accent outline-none resize-none mb-6 transition-colors" />
            <div className="flex justify-end"><button type="submit" className="bg-accent text-void font-bold px-8 py-3 rounded-full hover:bg-white transition-colors text-sm flex items-center gap-2">Post Comment <Send size={14} /></button></div>
         </form>

         <div className="space-y-10">
            {post.comments.length === 0 ? (
               <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl"><MessageCircle className="mx-auto mb-3 text-gray-600" size={32} /><p className="text-gray-500 italic">No signals detected yet. Be the first to transmit.</p></div>
            ) : (
               post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-5 animate-fadeIn">
                     <img src={comment.avatar} alt={comment.author} className="w-12 h-12 rounded-full border border-white/10" />
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-2"><span className="font-bold text-white text-base">{comment.author}</span><span className="text-xs text-gray-500 font-mono">{new Date(comment.date).toLocaleDateString()}</span></div>
                        <div className="bg-white/5 p-4 rounded-xl rounded-tl-none border border-white/5"><p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p></div>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
};