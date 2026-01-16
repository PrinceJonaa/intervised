
import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Layout, Cpu, User, Mail, Sparkles, X, Send, Settings2, CheckCircle2, Circle, Mic, MessageSquare, BookOpen, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Page } from '../types';

// Lazy load the AI panel content to defer loading the heavy useGeminiAI hook
const AIPanelContent = lazy(() => import('./AIPanelContent'));

export const NavDock = ({ currentPage, setPage }: { currentPage: Page; setPage: (p: Page) => void }) => {
  const [isAiActive, setIsAiActive] = useState(false);

  const navItems = [
    { page: Page.HOME, icon: Layout, label: 'Home' },
    { page: Page.SERVICES, icon: Cpu, label: 'Services' },
    { page: Page.BLOG, icon: BookOpen, label: 'Blog' },
    { page: Page.TEAM, icon: User, label: 'Team' },
    { page: Page.CHAT, icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <>
      <AnimatePresence>
        {isAiActive && (
          <Suspense fallback={
            <motion.div
              id="ai-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-panel-title"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="fixed bottom-28 left-2 right-2 md:bottom-28 md:left-1/2 md:-translate-x-1/2 md:w-[600px] glass-panel rounded-3xl p-4 sm:p-6 z-[150] border-t border-accent/30 shadow-[0_0_50px_rgba(244,201,93,0.15)] flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={18} className="text-accent animate-pulse" aria-hidden="true" />
                    <span id="ai-panel-title" className="font-display font-bold text-lg text-white tracking-tight">INTERVISED AI</span>
                  </div>
                  <span className="text-xs font-mono text-muted">Loading...</span>
                </div>
                <button onClick={() => setIsAiActive(false)} aria-label="Close AI Assistant" className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <div className="min-h-[80px] flex items-center justify-center">
                <div className="animate-pulse text-accent">Initializing AI...</div>
              </div>
            </motion.div>
          }>
            <AIPanelContent setPage={setPage} onClose={() => setIsAiActive(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Main Dock */}
      <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-auto max-w-[calc(100vw-32px)]" aria-label="Main Navigation">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel px-3 sm:px-4 py-2 sm:py-2.5 rounded-full flex items-center justify-between gap-1 sm:gap-3 shadow-2xl border border-white/10 backdrop-blur-xl bg-void/80"
        >
          {/* Navigation Items - Split by AI Button */}
          {navItems.slice(0, 3).map((item) => (
            <DockItem key={item.page} item={item} isActive={currentPage === item.page} onClick={() => setPage(item.page)} />
          ))}

          {/* AI Trigger Button */}
          <button
            onClick={() => setIsAiActive(!isAiActive)}
            aria-label="Toggle AI Assistant"
            aria-expanded={isAiActive}
            aria-controls="ai-panel"
            className={`mx-1 sm:mx-2 relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 ${isAiActive
              ? 'bg-gradient-to-tr from-secondary via-secondary to-accent scale-110 shadow-[0_0_40px_rgba(244,201,93,0.3)] border-transparent'
              : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105'
              }`}
          >
            {isAiActive ? (
              <Sparkles size={20} className="text-white animate-spin-slow sm:w-6 sm:h-6" aria-hidden="true" />
            ) : (
              <Sparkles size={20} className="text-accent sm:w-6 sm:h-6" aria-hidden="true" />
            )}

            {!isAiActive && (
              <>
                <span className="absolute inset-0 rounded-full border border-accent/20 animate-ping" style={{ animationDuration: '3s' }}></span>
                <span className="absolute -inset-1 rounded-full border border-secondary/20 animate-pulse"></span>
              </>
            )}
          </button>

          {/* Remaining Items including Chat */}
          {navItems.slice(3, 5).map((item) => (
            <DockItem key={item.page} item={item} isActive={currentPage === item.page} onClick={() => setPage(item.page)} />
          ))}

          <button
            onClick={() => setPage(Page.CONTACT)}
            aria-label="Contact Us"
            aria-current={currentPage === Page.CONTACT ? 'page' : undefined}
            className={`relative p-2.5 sm:p-3 rounded-full transition-all duration-300 group flex-shrink-0 ${currentPage === Page.CONTACT
              ? 'bg-white/10 text-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Mail size={18} className="sm:w-6 sm:h-6" aria-hidden="true" />
          </button>

        </motion.div>
      </nav>
    </>
  );
};

interface DockItemProps {
  item: {
    page: Page;
    icon: any;
    label: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const DockItem: React.FC<DockItemProps> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    aria-label={item.label}
    aria-current={isActive ? 'page' : undefined}
    className={`relative p-2.5 sm:p-3.5 rounded-full transition-all duration-300 group flex-shrink-0 ${isActive
      ? 'bg-white/10 text-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
      : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
  >
    <item.icon size={18} className="sm:w-6 sm:h-6" aria-hidden="true" />
    <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none hidden md:block font-mono tracking-widest backdrop-blur-md text-accent">
      {item.label.toUpperCase()}
    </span>
  </button>
);

export const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-6 flex justify-between items-center pointer-events-none">
    <Link to="/" className="flex items-center gap-3 pointer-events-auto cursor-pointer group" aria-label="Intervised Home">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/30 flex items-center justify-center relative overflow-hidden bg-black/20 backdrop-blur-sm group-hover:border-accent/50 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary to-accent opacity-50 group-hover:opacity-80 transition-opacity"></div>
        <span className="relative font-bold text-xs sm:text-sm text-white font-display">IV</span>
      </div>
      <div className="flex flex-col">
        <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white leading-none">INTERVISED</span>
        <span className="text-[10px] font-mono text-white/50 tracking-[0.2em] hidden sm:block">MUTUALLY ENVISIONED</span>
      </div>
    </Link>
    <div className="pointer-events-auto hidden sm:block">
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/20 backdrop-blur-md">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
        <span className="text-[10px] font-mono text-white/80">SYSTEM OPTIMAL</span>
      </div>
    </div>
  </header>
);
