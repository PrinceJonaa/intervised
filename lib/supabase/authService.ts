/**
 * Auth Service - Authentication with Supabase
 * 
 * Supports Google OAuth, email magic links, and session management
 */
import { supabase } from './client';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

export type { User, Session, Profile, UserRole };

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: UserRole;
}

// ============================================
// AUTHENTICATION METHODS
// ============================================

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `https://intervised.com/admin`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google sign in error:', error);
    throw new Error(error.message);
  }
}

/**
 * Sign in with email magic link
 */
export async function signInWithEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `https://intervised.com/admin`,
    },
  });

  if (error) {
    console.error('Email sign in error:', error);
    throw new Error(error.message);
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw new Error(error.message);
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Get session error:', error);
    return null;
  }
  return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Get user error:', error);
    return null;
  }
  return user;
}

/**
 * Get user profile from profiles table
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Get profile error:', error);
    return null;
  }
  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Update profile error:', error);
    throw new Error(error.message);
  }
  return data;
}

/**
 * Create user profile (called on first sign in)
 */
export async function createUserProfile(
  userId: string,
  email: string,
  metadata?: { full_name?: string; avatar_url?: string }
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: metadata?.full_name || null,
      avatar_url: metadata?.avatar_url || null,
      role: 'member', // Default role
    })
    .select()
    .single();

  if (error) {
    console.error('Create profile error:', error);
    throw new Error(error.message);
  }
  return data;
}

/**
 * Ensure user profile exists (create if not)
 */
export async function ensureUserProfile(user: User): Promise<Profile> {
  let profile = await getUserProfile(user.id);

  if (!profile) {
    profile = await createUserProfile(
      user.id,
      user.email || '',
      user.user_metadata as { full_name?: string; avatar_url?: string }
    );
  }

  return profile;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.role === 'admin';
}

/**
 * Check if user has contributor or higher role
 */
export async function isContributor(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.role === 'admin' || profile?.role === 'contributor';
}

// ============================================
// AUTH STATE SUBSCRIPTION
// ============================================

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

// Export as namespace for cleaner imports
export const authService = {
  signInWithGoogle,
  signInWithEmail,
  signOut,
  getSession,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  ensureUserProfile,
  isAdmin,
  isContributor,
  onAuthStateChange,
  verifyAdminServer,
};

/**
 * Verify admin status server-side via Edge Function
 */
export async function verifyAdminServer(): Promise<{ isAdmin: boolean; userId?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-admin', {
      method: 'POST',
    });

    if (error) throw error;
    return { isAdmin: !!data?.isAdmin, userId: data?.userId };
  } catch (err) {
    console.error('Server-side verification failed:', err);
    return { isAdmin: false };
  }
}
