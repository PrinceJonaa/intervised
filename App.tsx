
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, } from 'framer-motion';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { Page } from './types';

// Feature Modules
import { HomeView } from './features/Home';
import { ServicesSection } from './features/Services';
import { TeamSection } from './features/Team';
import { BlogSection } from './features/Blog';
import { ContactSection } from './features/Contact';
import { ChatPage } from './features/Chat';
import { LoginPage } from './features/Login';
import { AdminPage } from './features/Admin';

// Components
import { BackgroundScene } from './components/Background3D';
import { NavDock, Header } from './components/Navigation';
import { ToastProvider } from './components/ToastSystem';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthProvider } from './components/AuthProvider';

// SEO Hook
import { useSEO, SEO_CONFIG } from './hooks/useSEO';

// Route to Page enum mapping for backwards compatibility with NavDock
const routeToPage: Record<string, Page> = {
  '/': Page.HOME,
  '/services': Page.SERVICES,
  '/team': Page.TEAM,
  '/blog': Page.BLOG,
  '/contact': Page.CONTACT,
  '/chat': Page.CHAT,
  '/login': Page.HOME, // Map to HOME for NavDock (no specific login page in enum)
  '/admin': Page.HOME, // Map to HOME for NavDock (no specific admin page in enum)
};

const pageToRoute: Record<Page, string> = {
  [Page.HOME]: '/',
  [Page.SERVICES]: '/services',
  [Page.TEAM]: '/team',
  [Page.BLOG]: '/blog',
  [Page.CONTACT]: '/contact',
  [Page.CHAT]: '/chat',
};

// Animated page wrapper component
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// Individual page components with SEO
function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  useSEO(SEO_CONFIG.home);
  return (
    <PageWrapper>
      <HomeView setPage={setPage} />
    </PageWrapper>
  );
}

function ServicesPage({ 
  setPage, 
  onCategoryChange 
}: { 
  setPage: (p: Page) => void; 
  onCategoryChange: (cat: string | null) => void;
}) {
  useSEO(SEO_CONFIG.services);
  return (
    <PageWrapper>
      <ServicesSection onCategoryChange={onCategoryChange} setPage={setPage} />
    </PageWrapper>
  );
}

function TeamPage() {
  useSEO(SEO_CONFIG.team);
  return (
    <PageWrapper>
      <TeamSection />
    </PageWrapper>
  );
}

function BlogPage() {
  useSEO(SEO_CONFIG.blog);
  return (
    <PageWrapper>
      <BlogSection />
    </PageWrapper>
  );
}

function ContactPage() {
  useSEO(SEO_CONFIG.contact);
  return (
    <PageWrapper>
      <ContactSection />
    </PageWrapper>
  );
}

function ChatPageWrapper({ setPage }: { setPage: (p: Page) => void }) {
  useSEO(SEO_CONFIG.chat);
  return (
    <PageWrapper>
      <ChatPage setPage={setPage} />
    </PageWrapper>
  );
}

function LoginPageWrapper() {
  useSEO({ 
    title: 'Sign In | Intervised', 
    description: 'Sign in to your Intervised account to access exclusive features and manage your content.',
    path: '/login'
  });
  return (
    <PageWrapper>
      <LoginPage />
    </PageWrapper>
  );
}

function AdminPageWrapper() {
  useSEO({ 
    title: 'Admin Dashboard | Intervised', 
    description: 'Manage contacts, bookings, and content from the admin dashboard.',
    path: '/admin'
  });
  return (
    <PageWrapper>
      <AdminPage />
    </PageWrapper>
  );
}

// Main app content with routing
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Get current page enum from route for NavDock compatibility
  const currentPage = routeToPage[location.pathname] || Page.HOME;

  // Create setPage function that navigates using router
  const setPage = (page: Page) => {
    navigate(pageToRoute[page]);
  };

  // Scroll to top on route change and reset background category
  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.pathname !== '/services') {
      setActiveCategory(null);
    }
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-accent/30 selection:text-accent">
      <BackgroundScene activeCategory={activeCategory} />
      <Header />
      
      <main className="relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage setPage={setPage} />} />
            <Route 
              path="/services" 
              element={<ServicesPage setPage={setPage} onCategoryChange={setActiveCategory} />} 
            />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/chat" element={<ChatPageWrapper setPage={setPage} />} />
            <Route path="/login" element={<LoginPageWrapper />} />
            <Route path="/admin" element={<AdminPageWrapper />} />
            {/* Fallback route */}
            <Route path="*" element={<HomePage setPage={setPage} />} />
          </Routes>
        </AnimatePresence>
      </main>

      <NavDock currentPage={currentPage} setPage={setPage} />
      <ScrollToTop />
    </div>
  );
}

export default function App() {
  // Initialize Vercel Analytics and Speed Insights on app mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    (async () => {
      // Initialize Vercel Analytics
      try {
        const { inject } = await import('@vercel/analytics');
        inject();
        if (import.meta.env.DEV) {
          console.log('✓ Vercel Analytics initialized');
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('⚠ Vercel Analytics failed to load:', err);
        }
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
      <SpeedInsights debug={import.meta.env.DEV} />
    </BrowserRouter>
  );
}
