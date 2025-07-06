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
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-toast'
          ],
          'supabase-vendor': ['@supabase/supabase-js'],
          'blockchain-vendor': ['xrpl', 'qrcode'],
          'utils-vendor': ['jspdf', 'lucide-react'],
          
          // Application chunks
          'admin': ['./src/pages/Admin.tsx'],
          'workflow': ['./src/components/workflow'],
          'auth': ['./src/pages/Auth.tsx', './src/hooks/useAuth.tsx']
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
