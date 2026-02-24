import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Avoid preloading non-critical async dependency graphs on first paint
      modulePreload: false,
      // Increase chunk size warning limit to 1.5MB
      chunkSizeWarningLimit: 1500,
      // Copy public folder to dist
      copyPublicDir: true,
      // Enable source maps for production debugging
      sourcemap: mode === 'development',
    },
  };
});
