
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
const AboutPage = lazy(() => import('./features/About').then(m => ({ default: m.AboutPage })));
const ContactSection = lazy(() => import('./features/Contact').then(m => ({ default: m.ContactSection })));
const ChatPage = lazy(() => import('./features/Chat').then(m => ({ default: m.ChatPage })));
const LoginPage = lazy(() => import('./features/Login').then(m => ({ default: m.LoginPage })));
const AdminPage = lazy(() => import('./features/Admin').then(m => ({ default: m.AdminPage })));
const ProfilePage = lazy(() => import('./features/Profile').then(m => ({ default: m.ProfilePage })));
const PrivacyPage = lazy(() => import('./features/Privacy').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./features/Terms').then(m => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import('./features/NotFound').then(m => ({ default: m.NotFoundPage })));
const UserProfile = lazy(() => import('./features/blog/components/UserProfile').then(m => ({ default: m.default })));
const ProfileSettings = lazy(() => import('./features/blog/components/ProfileSettings').then(m => ({ default: m.default })));
const GuestAuthorApplication = lazy(() => import('./features/blog/components/GuestAuthorApplication').then(m => ({ default: m.default })));

// Lazy load heavy 3D background (1MB+ Three.js bundle)
const BackgroundScene = lazy(() => import('./components/Background3D').then(m => ({ default: m.BackgroundScene })));

// Components (keep Navigation eager for critical UI)
import { NavDock, Header } from './components/Navigation';
import { ToastProvider } from './components/ToastSystem';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthProvider, ProtectedRoute } from './components/AuthProvider';
import { SimpleFooter } from './components/SimpleFooter';
import { ErrorBoundary } from './components/ErrorBoundary';

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
  '/about': Page.HOME,
  '/blog': Page.BLOG,
  '/contact': Page.CONTACT,
  '/booking': Page.CONTACT,
  '/chat': Page.CHAT,
  '/login': Page.HOME, // Map to HOME for NavDock (no specific login page in enum)
  '/admin': Page.HOME, // Map to HOME for NavDock (no specific admin page in enum)
  '/profile': Page.HOME, // Map to HOME/Default for NavDock
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

function AboutPageWrapper() {
  useSEO(SEO_CONFIG.about);
  return (
    <PageWrapper>
      <AboutPage />
    </PageWrapper>
  );
}

function BlogPage() {
  const location = useLocation();

  useSEO(
    location.pathname === '/blog'
      ? SEO_CONFIG.blog
      : {
        title: 'Intervised Blog | Intervised',
        description: 'Read insights from Intervised on creative systems, web development, AI integration, and digital strategy.',
        canonical: `https://intervised.com${location.pathname}`
      }
  );

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
    description: 'Sign in to your Intervised account to access exclusive features and manage your content.'
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
    description: 'Command Center for Intervised administrators.',
    noIndex: true, // Admin page shouldn't be indexed
    canonical: 'https://intervised.com/admin'
  });
  return (
    <PageWrapper>
      <AdminPage />
    </PageWrapper>
  );
}

function ProfilePageWrapper() {
  useSEO({
    title: 'My Profile | Intervised',
    description: 'Manage your profile settings.',
    noIndex: true
  });
  return (
    <PageWrapper>
      <ProfilePage />
    </PageWrapper>
  );
}

function PrivacyPageWrapper() {
  useSEO({
    title: 'Privacy Policy | Intervised',
    description: 'Read our Privacy Policy to understand how we collect, use, and protect your data.',
    canonical: 'https://intervised.com/privacy'
  });
  return (
    <PageWrapper>
      <PrivacyPage />
    </PageWrapper>
  );
}

function TermsPageWrapper() {
  useSEO({
    title: 'Terms of Service | Intervised',
    description: 'Read our Terms of Service regarding your use of the Intervised website and services.',
    canonical: 'https://intervised.com/terms'
  });
  return (
    <PageWrapper>
      <TermsPage />
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
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-accent focus:text-void focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>
      <Suspense fallback={<BackgroundPlaceholder />}>
        <BackgroundScene activeCategory={activeCategory} />
      </Suspense>
      <Header />

      <main id="main-content" className="relative">
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageSkeleton />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage setPage={setPage} />} />
              <Route
                path="/services"
                element={<ServicesPage setPage={setPage} onCategoryChange={setActiveCategory} />}
              />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/about" element={<AboutPageWrapper />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/booking" element={<ContactPage />} />
              <Route path="/chat" element={<ChatPageWrapper setPage={setPage} />} />
              <Route path="/login" element={<LoginPageWrapper />} />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin" fallback={<LoginPageWrapper />}>
                  <AdminPageWrapper />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute fallback={<LoginPageWrapper />}>
                  <ProfilePageWrapper />
                </ProtectedRoute>
              } />
              <Route path="/user/:id" element={<UserProfile />} />
              <Route path="/settings/profile" element={
                <ProtectedRoute fallback={<LoginPageWrapper />}>
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              <Route path="/settings/notifications" element={
                <ProtectedRoute fallback={<LoginPageWrapper />}>
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              <Route path="/apply/author" element={
                <ProtectedRoute fallback={<LoginPageWrapper />}>
                  <GuestAuthorApplication />
                </ProtectedRoute>
              } />
              <Route path="/privacy" element={<PrivacyPageWrapper />} />
              <Route path="/terms" element={<TermsPageWrapper />} />
              {/* 404 Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>

      <SimpleFooter />
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
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
      <SpeedInsights debug={import.meta.env.DEV} />
    </BrowserRouter>
  );
}
