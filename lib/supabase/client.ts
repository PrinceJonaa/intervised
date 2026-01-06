/**
 * Supabase Client Configuration
 * 
 * This module initializes and exports the Supabase client for use throughout the app.
 * Environment variables are injected at build time by Vite (synced via Vercel Integration).
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables (Vercel Integration syncs these automatically)
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

// Fallback for development (these are public anon keys, safe to expose)
const FALLBACK_URL = 'https://jnfnqtohljybohlcslnm.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZm5xdG9obGp5Ym9obGNzbG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NjA1MDksImV4cCI6MjA4MzIzNjUwOX0.1z3v0yieVMz88w3oyccht2zJowHzFEUnfg2tB_5iYmc';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Missing Supabase environment variables. Using fallback for development.',
    '\nExpected: VITE_PUBLIC_SUPABASE_URL, VITE_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Create the Supabase client with type safety
export const supabase = createClient<Database>(
  supabaseUrl || FALLBACK_URL,
  supabaseAnonKey || FALLBACK_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // More secure for SPAs
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-application-name': 'intervised',
      },
    },
  }
);

// Export typed helpers
export type { Database };
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
