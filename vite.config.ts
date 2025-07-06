import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Only include development plugins in dev mode
    mode === 'development' && componentTagger()
  ].filter(Boolean),
  
  // Performance optimizations
  build: {
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-vendor';
            }
            if (id.includes('xrpl') || id.includes('qrcode')) {
              return 'blockchain-vendor';
            }
            if (id.includes('jspdf') || id.includes('lucide-react')) {
              return 'utils-vendor';
            }
          }
          
          // Application chunks
          if (id.includes('/pages/Admin.')) {
            return 'admin';
          }
          if (id.includes('/components/workflow/')) {
            return 'workflow';
          }
          if (id.includes('/pages/Auth.') || id.includes('/hooks/useAuth.')) {
            return 'auth';
          }
        }
      }
    },
    
    // Build optimizations
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : []
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Asset optimization
    assetsInlineLimit: 4096, // 4kb
  },
  
  // Development server optimization  
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true
    }
  },
  
  // Path resolution
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js'
    ]
  }
}));
