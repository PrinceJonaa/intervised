import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Increase chunk size warning limit to 1.5MB
        chunkSizeWarningLimit: 1500,
        // Generate clean URLs for SPA
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
              'motion-vendor': ['framer-motion'],
              'supabase-vendor': ['@supabase/supabase-js'],
              'ui-vendor': ['lucide-react'],
              'analytics-vendor': ['@vercel/analytics', '@vercel/speed-insights'],
              'ai-vendor': ['@google/genai'],
            },
          },
        },
        // Copy public folder to dist
        copyPublicDir: true,
        // Enable source maps for production debugging
        sourcemap: mode === 'development',
      },
    };
});

