import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true,
      // Include .jsx files
      include: '**/*.{jsx,tsx}',
    })
  ],
  base: '/',
  
  // Enhanced server configuration
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  
  // Optimized build configuration
  build: {
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    // Reduce bundle size
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        // Optimized chunking strategy
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // Chart libraries
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          
          // Animation libraries
          'animation-vendor': ['framer-motion', 'lottie-react'],
          
          // Data visualization
          'd3-vendor': ['d3'],
          
          // AI/ML libraries
          'ai-vendor': ['@tensorflow/tfjs'],
          
          // SEO and analytics
          'seo-vendor': ['react-helmet-async'],
          
          // Icons and UI
          'ui-vendor': ['@heroicons/react', 'lucide-react'],
          
          // Utilities
          'utils-vendor': ['react-hot-toast']
        },
        
        // Generate readable chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // Optimize asset compression
        compact: true,
      },
      
      // External dependencies (if using CDN)
      external: [],
    },
    
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets < 4kb
    
    // CSS optimization
    cssMinify: 'esbuild',
  },
  
  // CSS configuration with optimizations
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
    modules: {
      scopeBehaviour: 'local',
      // Optimize CSS modules
      localsConvention: 'camelCase',
    },
    // Enable CSS source maps in development
    devSourcemap: true,
  },
  
  // Optimized dependency handling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-helmet-async',
      'chart.js',
      'react-chartjs-2'
    ],
    // Exclude large dependencies that should be lazy-loaded
    exclude: [
      '@tensorflow/tfjs',
      '@splinetool/react-spline'
    ],
  },
  
  // Enable modern features
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Enable top-level await
    target: 'es2022',
  },
  
  // Performance monitoring
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // Preview server configuration
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
    },
  },
})