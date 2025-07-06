import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Integration test environment
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./src/test/setup.ts'],
    
    // Global test configuration
    globals: true,
    
    // Extended timeouts for integration tests
    testTimeout: 30000,
    hookTimeout: 30000,
    
    // Coverage configuration for integration tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/',
        'coverage/',
        'src/integrations/supabase/types.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // Performance optimizations for integration tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    
    // Integration test file patterns
    include: [
      'src/**/*.integration.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/test/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // Retry configuration for flaky integration tests
    retry: 3,
    
    // Watch options
    watchIgnore: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**'
    ]
  },
  
  // Path resolution (same as main app)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Define environment variables for integration tests
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('http://localhost:54321'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('test-anon-key'),
    'import.meta.env.DEV': false,
    'import.meta.env.PROD': true
  }
})