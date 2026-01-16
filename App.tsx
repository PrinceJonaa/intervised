
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence, } from 'framer-motion';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { Page } from './types';

// Lazy load feature modules for better initial bundle size
const HomeView = lazy(() => import('./features/Home').then(m => ({ default: m.HomeView })));
const ServicesSection = lazy(() => import('./features/Services').then(m => ({ default: m.ServicesSection })));
const TeamSection = lazy(() => import('./features/Team').then(m => ({ default: m.TeamSection })));
const BlogSection = lazy(() => import('./features/Blog').then(m => ({ default: m.BlogSection })));
const ContactSection = lazy(() => import('./features/Contact').then(m => ({ default: m.ContactSection })));
const ChatPage = lazy(() => import('./features/Chat').then(m => ({ default: m.ChatPage })));
const LoginPage = lazy(() => import('./features/Login').then(m => ({ default: m.LoginPage })));
const AdminPage = lazy(() => import('./features/Admin').then(m => ({ default: m.AdminPage })));

// Lazy load heavy 3D background (1MB+ Three.js bundle)
const BackgroundScene = lazy(() => import('./components/Background3D').then(m => ({ default: m.BackgroundScene })));

// Components (keep Navigation eager for critical UI)
import { NavDock, Header } from './components/Navigation';
import { ToastProvider } from './components/ToastSystem';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthProvider, ProtectedRoute } from './components/AuthProvider';

// Loading skeleton for lazy components
const PageSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-white/10"></div>
      <div className="h-4 w-32 bg-white/10 rounded"></div>
    </div>
  </div>
);

// Background loading placeholder (invisible, just reserves space)
const BackgroundPlaceholder = () => (
  <div className="fixed inset-0 bg-void -z-10" />
);

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
      <Suspense fallback={<BackgroundPlaceholder />}>
        <BackgroundScene activeCategory={activeCategory} />
      </Suspense>
      <Header />

      <main className="relative">
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageSkeleton />}>
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
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin" fallback={<LoginPageWrapper />}>
                  <AdminPageWrapper />
                </ProtectedRoute>
              } />
              {/* Fallback route */}
              <Route path="*" element={<HomePage setPage={setPage} />} />
            </Routes>
          </Suspense>
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
