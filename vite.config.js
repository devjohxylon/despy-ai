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
          'ui-vendor': ['framer-motion', 'react-hot-toast'],
          'charts-vendor': ['recharts', 'd3'],
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'utils-vendor': ['lucide-react', 'clsx']
        },
        format: 'es',
        entryFileNames: '[name]-[hash].mjs',
        chunkFileNames: '[name]-[hash].mjs',
        assetFileNames: '[name]-[hash][extname]'
      }
    },
    cssCodeSplit: true,
    cssMinify: true,
    modulePreload: {
      polyfill: true
    },
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000
  },
  css: {
    devSourcemap: false,
    modules: {
      scopeBehavior: 'local'
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion']
  }
});