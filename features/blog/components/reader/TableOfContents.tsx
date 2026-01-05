import React, { useState, useEffect } from 'react';
import { ListOrdered, ChevronRight, AlignRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TableOfContents = ({ 
    content, 
    isMobile = false, 
    onItemClick,
    collapsed = false,
    onToggleCollapse
}: { 
    content: string, 
    isMobile?: boolean, 
    onItemClick?: () => void,
    collapsed?: boolean,
    onToggleCollapse?: () => void
}) => {
  const [activeId, setActiveId] = useState<string>('');

  const headings = content.split('\n').filter(line => line.startsWith('#') && !line.startsWith('####')).map(line => {
    const level = line.match(/^#+/)?.[0].length || 0;
    const text = line.replace(/^#+\s/, '').trim();
    // Must match MarkdownRenderer ID generation
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    return { level, text, id };
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const list = (
     <div className="relative pl-2">
        {/* Continuous Track */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/5 rounded-full" />
        
        <ul className="space-y-4">
            {headings.map((h, i) => (
               <li key={i} className="relative pl-6" style={{ marginLeft: `${(h.level - 1) * 8}px` }}>
                  <a 
                    href={`#${h.id}`} 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                      if (onItemClick) onItemClick();
                    }} 
                    className={`block text-xs md:text-sm transition-all duration-300 leading-relaxed ${activeId === h.id ? 'text-white font-medium translate-x-1' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                     {/* Animated Glowing Dot */}
                     {activeId === h.id && (
                        <motion.div 
                            layoutId="active-toc-dot"
                            className="absolute -left-[19px] top-[6px] w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(244,201,93,0.8)] z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                     )}
                     {h.text}
                  </a>
               </li>
            ))}
        </ul>
     </div>
  );

  if (isMobile) {
      return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-8 opacity-40">
                <AlignRight size={14} />
                <span className="text-[10px] font-mono uppercase tracking-widest">Article Map</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                {list}
            </div>
        </div>
      );
  }

  // Desktop
  return (
    <div className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
        <div 
            className={`
                bg-white/5 backdrop-blur-xl border border-white/10 
                transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden
                ${collapsed 
                    ? 'w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-accent/50 cursor-pointer shadow-lg active:scale-95' 
                    : 'w-full rounded-2xl p-6 shadow-2xl'
                }
            `}
            onClick={collapsed ? onToggleCollapse : undefined}
        >
           {collapsed ? (
               <ListOrdered size={20} className="text-gray-400" />
           ) : (
               <div className="flex flex-col h-full">
                   <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                       <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                           <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.25em]">Contents</span>
                       </div>
                       <button 
                          onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); }}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                          title="Collapse Sidebar"
                       >
                           <ChevronRight size={14} />
                       </button>
                   </div>
                   
                   <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                       {list}
                   </div>
               </div>
           )}
        </div>
    </div>
  );
};