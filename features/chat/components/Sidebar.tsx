import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, PanelLeftClose, Trash2, BrainCircuit, ChevronRight, ArrowLeft } from 'lucide-react';
import { ChatSession } from '../../../types';

interface ChatSidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onLoadSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen, isMobile, onClose, onOpenSettings, sessions, activeSessionId, onLoadSession, onNewSession, onDeleteSession
}) => {
  const containerClass = isMobile 
    ? "w-full h-full flex flex-col bg-void"
    : "hidden md:flex flex-col gap-4 h-full border-r border-white/10 pr-4 flex-shrink-0 w-[280px]";

  if (!isOpen && !isMobile) return null;

  return (
    <div className={containerClass}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-void/50 backdrop-blur-md">
            <h2 className="font-display font-bold text-lg text-white">HISTORY</h2>
            <button 
                onClick={onClose} 
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
            >
                Close <ChevronRight size={16} />
            </button>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">Transmissions</span>
            <div className="flex gap-1">
               <button onClick={onOpenSettings} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-accent transition-colors" title="Neural Config">
                 <Settings size={16} />
               </button>
               <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                 <PanelLeftClose size={16} />
               </button>
            </div>
          </div>
      )}

      <div className={`flex-1 overflow-y-auto custom-scrollbar space-y-1 ${isMobile ? 'p-4' : 'pr-1'}`}>
         <button onClick={onNewSession} className="flex items-center gap-3 w-full p-4 md:p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group mb-4">
            <div className="p-1.5 md:p-1 bg-accent/20 rounded-md text-accent group-hover:text-white"><Plus size={20} /></div>
            <span className="text-base md:text-sm font-bold text-gray-300 group-hover:text-white">New Transmission</span>
         </button>

         {sessions.map(session => (
            <button
               key={session.id}
               onClick={() => onLoadSession(session.id)}
               className={`w-full text-left p-4 md:p-3 rounded-xl md:rounded-lg text-sm flex items-center justify-between group transition-all border ${activeSessionId === session.id ? 'bg-white/10 text-white shadow-lg border-white/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border-transparent'}`}
            >
               <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-base md:text-sm">{session.title}</div>
                  <div className="flex gap-2 items-center mt-1">
                     <span className="text-[10px] text-gray-600 font-mono">{new Date(session.lastModified).toLocaleDateString()}</span>
                     {session.analysis?.detectedChains?.length ? (
                        <div className="flex gap-1 items-center">
                           <div className="w-1 h-1 rounded-full bg-secondary"></div>
                           <span className="text-[9px] text-gray-600 font-mono tracking-wide">STRATEGY</span>
                        </div>
                     ) : null}
                  </div>
               </div>
               {activeSessionId === session.id ? (
                  <div onClick={(e) => onDeleteSession(e, session.id)} className="p-2 hover:text-red-400 transition-colors"><Trash2 size={16} /></div>
               ) : (
                  <ChevronRight size={16} className="text-gray-700 group-hover:text-gray-500" />
               )}
            </button>
         ))}
      </div>
    </div>
  );
};