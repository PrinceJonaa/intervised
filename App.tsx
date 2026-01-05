
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Page } from './types';

// Feature Modules
import { HomeView } from './features/Home';
import { ServicesSection } from './features/Services';
// BookingSection removed
import { TeamSection } from './features/Team';
import { BlogSection } from './features/Blog';
import { ContactSection } from './features/Contact';
import { ChatPage } from './features/Chat';

// Components
import { BackgroundScene } from './components/Background3D';
import { NavDock, Header } from './components/Navigation';
import { ToastProvider } from './components/ToastSystem';
import { ScrollToTop } from './components/ScrollToTop';

export default function App() {
  const [page, setPage] = useState<Page>(Page.HOME);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Scroll to top on page change and reset background category
  useEffect(() => {
    window.scrollTo(0, 0);
    if (page !== Page.SERVICES) {
      setActiveCategory(null);
    }
  }, [page]);

  return (
    <ToastProvider>
      <div className="relative min-h-screen text-white font-sans selection:bg-accent/30 selection:text-accent">
        <BackgroundScene activeCategory={activeCategory} />
        <Header />
        
        {/* Removed z-10 to allow overlays to escape this stacking context */}
        <main className="relative">
          <AnimatePresence mode="wait">
            {page === Page.HOME && (
              <motion.div key="home" exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 0.5 }}>
                <HomeView setPage={setPage} />
              </motion.div>
            )}
            {page === Page.SERVICES && (
              <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ServicesSection onCategoryChange={setActiveCategory} setPage={setPage} />
              </motion.div>
            )}
            {page === Page.TEAM && (
              <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TeamSection />
              </motion.div>
            )}
            {page === Page.BLOG && (
              <motion.div key="blog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BlogSection />
              </motion.div>
            )}
            {page === Page.CONTACT && (
              <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ContactSection />
              </motion.div>
            )}
             {page === Page.CHAT && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ChatPage setPage={setPage} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <NavDock currentPage={page} setPage={setPage} />
        <ScrollToTop />
      </div>
    </ToastProvider>
  );
}
