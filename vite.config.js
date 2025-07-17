import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Optimized config for production builds
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
    cssCodeSplit: true,
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    assetsInlineLimit: 4096,
    reportCompressedSize: true
  },
  css: {
    devSourcemap: false,
    modules: {
      scopeBehavior: 'local'
    }
  },
  server: {
    port: 3000,
    strictPort: true
  }
});