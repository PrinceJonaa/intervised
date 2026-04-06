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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. ' +
    'Please ensure VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY are set in your .env file or Vercel project settings.'
  );
}

// Create the Supabase client with type safety
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
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

/**
 * Test the database connection. Returns true if connected, false otherwise.
 * Useful for health checks and detecting paused Supabase projects.
 */
export async function checkDatabaseConnection(): Promise<{ connected: boolean; latencyMs: number | null; error: string | null }> {
  const start = performance.now();
  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - start);
    if (error) {
      // Supabase returns 503 or specific messages for paused projects
      if (error.message?.includes('project has been paused') || error.code === '503') {
        return { connected: false, latencyMs: null, error: 'PROJECT_PAUSED' };
      }
      return { connected: false, latencyMs: null, error: error.message };
    }
    return { connected: true, latencyMs, error: null };
  } catch (err: any) {
    return { connected: false, latencyMs: null, error: err?.message || 'Connection failed' };
  }
}

// Export typed helpers
export type { Database };
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
