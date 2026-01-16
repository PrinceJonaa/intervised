/**
 * Auth Hook - React hook for authentication state
 */
import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  authService,
  type Profile,
  type UserRole,
} from '../lib/supabase/authService';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isContributor: boolean;
}

export interface AuthActions {
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  verifyAdminServer: () => Promise<{ isAdmin: boolean; userId?: string }>;
}

export type UseAuthReturn = AuthState & AuthActions;

/**
 * Hook for managing authentication state
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed values
  const isAuthenticated = !!user;
  const isAdmin = profile?.role === 'admin';
  const isContributor = profile?.role === 'admin' || profile?.role === 'contributor';

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Check for auth code in URL (OAuth callback)
        const isAuthCallback = window.location.search.includes('code=');

        const currentSession = await authService.getSession();

        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Load user profile
          const userProfile = await authService.ensureUserProfile(currentSession.user);
          if (mounted) {
            setProfile(userProfile);
          }
        }

        // If we found a session OR if this isn't an auth callback, we can stop loading.
        // If it IS an auth callback but no session yet, we wait for onAuthStateChange
        // to fire (it handles the code exchange).
        if (currentSession || !isAuthCallback) {
          setIsLoading(false);
        } else {
          // Safety timeout: if auth callback hangs (e.g. invalid code), stop loading eventually
          setTimeout(() => {
            if (mounted) setIsLoading(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const unsubscribe = authService.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('Auth state change:', event);

      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        // Load/ensure profile on sign in
        const userProfile = await authService.ensureUserProfile(newSession.user);
        if (mounted) {
          setProfile(userProfile);
        }
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Actions
  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signInWithGoogle();
      // Auth state will update via subscription
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await authService.signInWithEmail(email);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await authService.getUserProfile(user.id);
      setProfile(updatedProfile);
    }
  }, [user]);

  const verifyAdminServer = useCallback(async () => {
    // Check cache
    const now = Date.now();
    if (
      verificationCache &&
      verificationCache.userId === user?.id &&
      now - verificationCache.timestamp < CACHE_DURATION
    ) {
      return { isAdmin: verificationCache.isAdmin, userId: user?.id };
    }

    // Call server
    const result = await authService.verifyAdminServer();

    // Update cache
    if (user) {
      verificationCache = {
        timestamp: now,
        isAdmin: result.isAdmin,
        userId: user.id
      };
    }

    return result;
  }, [user]);

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isContributor,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    refreshProfile,
    verifyAdminServer,
  };
}

// Cache for admin verification
let verificationCache: {
  timestamp: number;
  isAdmin: boolean;
  userId: string | null;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to require authentication - redirects if not authenticated
 */
export function useRequireAuth(requiredRole?: UserRole): UseAuthReturn {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Could redirect to login page
      console.warn('Authentication required');
    }

    if (!auth.isLoading && requiredRole && auth.profile) {
      const hasRole =
        requiredRole === 'member' ||
        (requiredRole === 'contributor' && auth.isContributor) ||
        (requiredRole === 'admin' && auth.isAdmin);

      if (!hasRole) {
        console.warn('Insufficient permissions');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.profile, requiredRole, auth.isContributor, auth.isAdmin]);

  return auth;
}
