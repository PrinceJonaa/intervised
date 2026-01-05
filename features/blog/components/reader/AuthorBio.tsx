import React from 'react';
import { Twitter, Linkedin, Globe } from 'lucide-react';
import { BlogPost } from '../../../../types';

export const AuthorBio = ({ post }: { post: BlogPost }) => (
  <div className="my-16 p-8 bg-white/5 border-l-4 border-accent rounded-r-2xl flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-xl">
     <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent flex-shrink-0 shadow-lg"><img src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} alt={post.author} className="w-full h-full object-cover" /></div>
     <div className="text-center sm:text-left flex-1">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-2 mb-2"><h4 className="font-bold text-white text-xl">{post.author}</h4><span className="text-accent font-mono text-xs uppercase tracking-widest mb-1">{post.authorRole || 'Contributor'}</span></div>
        <p className="text-gray-400 leading-relaxed mb-4">Explorer of the intersection between faith, technology, and art. Building systems that serve the sacred and amplifying voices through coherent design.</p>
        <div className="flex justify-center sm:justify-start gap-4"><button className="text-gray-500 hover:text-white transition-colors"><Twitter size={18} /></button><button className="text-gray-500 hover:text-white transition-colors"><Linkedin size={18} /></button><button className="text-gray-500 hover:text-white transition-colors"><Globe size={18} /></button></div>
     </div>
  </div>
);