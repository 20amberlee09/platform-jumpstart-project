import { describe, it, expect, vi, beforeEach } from 'vitest'
import { XRPLService } from '@/services/xrplService'

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}))

// Mock the Web Crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn()
    }
  }
})

describe('XRPLService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('submitDocumentToBlockchain', () => {
    it('successfully submits document to blockchain via Edge Function', async () => {
      const mockResponse = {
        success: true,
        transactionHash: 'test-tx-hash-123',
        ledgerIndex: 12345,
        verificationUrl: 'https://testnet.xrpl.org/transactions/test-tx-hash-123',
        network: 'testnet'
      }

      const mockSupabase = require('@/integrations/supabase/client').supabase
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockResponse,
        error: null
      })

      const result = await XRPLService.submitDocumentToBlockchain(
        'test-document-hash',
        'test-doc-id',
        { userInfo: 'test' }
      )

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('xrp-submit-document', {
        body: {
          documentHash: 'test-document-hash',
          documentId: 'test-doc-id',
          userInfo: { userInfo: 'test' }
        }
      })

      expect(result).toEqual({
        transactionHash: 'test-tx-hash-123',
        ledgerIndex: 12345,
        verificationUrl: 'https://testnet.xrpl.org/transactions/test-tx-hash-123',
        proof: 'XRP Ledger testnet Verification',
        timestamp: expect.any(String),
        network: 'testnet'
      })
    })

    it('handles Edge Function errors', async () => {
      const mockSupabase = require('@/integrations/supabase/client').supabase
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Edge function failed' }
      })

      await expect(
        XRPLService.submitDocumentToBlockchain('test-hash')
      ).rejects.toThrow('Edge function failed: Edge function failed')
    })

    it('handles unsuccessful blockchain submission', async () => {
      const mockSupabase = require('@/integrations/supabase/client').supabase
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: false, error: 'Blockchain submission failed' },
        error: null
      })

      await expect(
        XRPLService.submitDocumentToBlockchain('test-hash')
      ).rejects.toThrow('Blockchain verification failed: Blockchain submission failed')
    })

    it('generates document ID when not provided', async () => {
      const mockSupabase = require('@/integrations/supabase/client').supabase
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, transactionHash: 'test-hash' },
        error: null
      })

      await XRPLService.submitDocumentToBlockchain('test-hash')

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('xrp-submit-document', {
        body: {
          documentHash: 'test-hash',
          documentId: expect.stringMatching(/^doc_\d+$/),
          userInfo: {}
        }
      })
    })
  })

  describe('verifyDocument', () => {
    it('successfully verifies document using public API', async () => {
      const mockApiResponse = {
        result: 'tesSUCCESS',
        validated: true,
        date: '2023-01-01T00:00:00Z',
        ledger_index: 12345,
        network: 'testnet'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      })

      const result = await XRPLService.verifyDocument('test-tx-hash')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.xrpscan.com/api/v1/transaction/test-tx-hash'
      )

      expect(result).toEqual({
        verified: true,
        timestamp: '2023-01-01T00:00:00Z',
        ledgerIndex: 12345,
        transactionHash: 'test-tx-hash',
        network: 'testnet'
      })
    })

    it('handles failed verification', async () => {
      const mockApiResponse = {
        result: 'tecFAILED',
        validated: false,
        date: '2023-01-01T00:00:00Z',
        ledger_index: 12345
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      })

      const result = await XRPLService.verifyDocument('test-tx-hash')

      expect(result.verified).toBe(false)
    })

    it('handles API request failures', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })

      const result = await XRPLService.verifyDocument('test-tx-hash')

      expect(result).toEqual({
        verified: false,
        error: 'API request failed: 404',
        transactionHash: 'test-tx-hash'
      })
    })

    it('handles network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await XRPLService.verifyDocument('test-tx-hash')

      expect(result).toEqual({
        verified: false,
        error: 'Network error',
        transactionHash: 'test-tx-hash'
      })
    })
  })

  describe('generateDocumentHash', () => {
    it('generates SHA-512 hash from document content', async () => {
      const mockHashBuffer = new ArrayBuffer(64) // SHA-512 produces 64 bytes
      const mockUint8Array = new Uint8Array(64).fill(255) // All bytes set to 255 for testing
      
      // Mock Uint8Array constructor to return our test array
      const mockUint8ArrayInstance = Array.from({ length: 64 }, () => 255)
      
      global.crypto.subtle.digest = vi.fn().mockResolvedValue(mockHashBuffer)
      global.Array.from = vi.fn().mockReturnValue(mockUint8ArrayInstance)

      const testContent = new ArrayBuffer(100)
      const hash = await XRPLService.generateDocumentHash(testContent)

      expect(global.crypto.subtle.digest).toHaveBeenCalledWith('SHA-512', testContent)
      expect(hash).toBe('f'.repeat(128)) // 64 bytes * 2 hex chars = 128 chars, all 'ff' -> 'f'
    })

    it('handles hash generation errors', async () => {
      global.crypto.subtle.digest = vi.fn().mockRejectedValue(new Error('Crypto error'))

      const testContent = new ArrayBuffer(100)

      await expect(
        XRPLService.generateDocumentHash(testContent)
      ).rejects.toThrow('Failed to generate document hash')
    })
  })

  describe('getNetworkStatus', () => {
    it('returns connected status when API is reachable', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true
      })

      const result = await XRPLService.getNetworkStatus()

      expect(global.fetch).toHaveBeenCalledWith('https://api.xrpscan.com/api/v1/ledger')
      expect(result).toEqual({
        network: 'testnet', // In test environment
        connected: true
      })
    })

    it('returns disconnected status when API is unreachable', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await XRPLService.getNetworkStatus()

      expect(result).toEqual({
        network: 'unknown',
        connected: false
      })
    })

    it('detects production environment', async () => {
      // Mock production environment
      Object.defineProperty(import.meta, 'env', {
        value: { PROD: true },
        configurable: true
      })

      global.fetch = vi.fn().mockResolvedValue({
        ok: true
      })

      const result = await XRPLService.getNetworkStatus()

      expect(result.network).toBe('mainnet')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles null document hash', async () => {
      await expect(
        XRPLService.submitDocumentToBlockchain('')
      ).rejects.toThrow('Blockchain verification failed')
    })

    it('handles undefined user info gracefully', async () => {
      const mockSupabase = require('@/integrations/supabase/client').supabase
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, transactionHash: 'test-hash' },
        error: null
      })

      await XRPLService.submitDocumentToBlockchain('test-hash', undefined, undefined)

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('xrp-submit-document', {
        body: {
          documentHash: 'test-hash',
          documentId: expect.stringMatching(/^doc_\d+$/),
          userInfo: {}
        }
      })
    })

    it('logs appropriate messages during operations', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const mockSupabase = require('@/integrations/supabase/client').supabase
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, transactionHash: 'test-hash' },
        error: null
      })

      await XRPLService.submitDocumentToBlockchain('test-hash')

      expect(consoleSpy).toHaveBeenCalledWith(
        'XRPLService: Submitting document to blockchain via Edge Function'
      )
      expect(consoleSpy).toHaveBeenCalledWith('Document hash:', 'test-hash')
      expect(consoleSpy).toHaveBeenCalledWith('Blockchain submission successful:', 'test-hash')

      consoleSpy.mockRestore()
    })
  })
})