import '@testing-library/jest-dom'
import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// Mock Supabase client to avoid real API calls
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null })
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    }
  }
}))

// Mock XRP Ledger service
vi.mock('@/services/xrplService', () => ({
  XRPLService: {
    submitDocumentToBlockchain: vi.fn().mockResolvedValue({
      transactionHash: 'mock-tx-hash',
      ledgerIndex: 12345,
      verificationUrl: 'https://testnet.xrpl.org/transactions/mock-tx-hash',
      proof: 'XRP Ledger testnet Verification',
      timestamp: new Date().toISOString(),
      network: 'testnet'
    }),
    verifyDocument: vi.fn().mockResolvedValue({
      verified: true,
      timestamp: new Date().toISOString(),
      ledgerIndex: 12345,
      transactionHash: 'mock-tx-hash',
      network: 'testnet'
    }),
    generateDocumentHash: vi.fn().mockResolvedValue('mock-hash-12345'),
    getNetworkStatus: vi.fn().mockResolvedValue({
      network: 'testnet',
      connected: true
    })
  }
}))

// Mock PDF generation
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    output: vi.fn().mockReturnValue('mock-pdf-data'),
    setFontSize: vi.fn(),
    setFont: vi.fn()
  }))
}))

// Mock QR code generation
vi.mock('qrcode', () => ({
  toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock-qr-code')
}))

// Mock Google APIs
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn().mockImplementation(() => ({
        getClient: vi.fn().mockResolvedValue({}),
        scopes: []
      }))
    },
    drive: vi.fn().mockImplementation(() => ({
      files: {
        create: vi.fn().mockResolvedValue({ data: { id: 'mock-file-id' } }),
        get: vi.fn().mockResolvedValue({ data: { name: 'mock-file.pdf' } })
      }
    }))
  }
}))

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn()
  },
  writable: true
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
})

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn().mockReturnValue(Date.now()),
    getEntriesByType: vi.fn().mockReturnValue([
      {
        loadEventEnd: 1000,
        loadEventStart: 900
      }
    ])
  },
  writable: true
})

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Clean up after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.clearAllMocks()
  
  // Clear localStorage
  window.localStorage.clear()
})

// Close server after all tests
afterAll(() => {
  server.close()
})

// Global test utilities
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User'
  },
  aud: 'authenticated',
  role: 'authenticated'
}

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser
}

export const mockProfile = {
  id: 'test-profile-id',
  user_id: 'test-user-id',
  full_name: 'Test User',
  email: 'test@example.com',
  minister_verified: true,
  verification_status: 'verified'
}