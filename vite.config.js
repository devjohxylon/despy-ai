import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Simplified config for faster builds
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'react-hot-toast']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild', // Faster than terser
    target: 'es2015' // Better compatibility
  },
  server: {
    port: 3000,
    strictPort: true
  }
});