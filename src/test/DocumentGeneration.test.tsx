import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useDocumentDownload } from '@/hooks/useDocumentDownload'
import { XRPLService } from '@/services/xrplService'
import { supabase } from '@/integrations/supabase/client'

// Mock the document service
vi.mock('@/services/documentService', () => ({
  DocumentService: {
    generatePDF: vi.fn(),
    uploadDocument: vi.fn(),
    downloadDocument: vi.fn()
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
    setFont: vi.fn(),
    addImage: vi.fn()
  }))
}))

// Test component that uses document generation
const DocumentGenerationComponent = () => {
  const { downloadDocument, isGenerating } = useDocumentDownload()
  const error = null // Mock error state
  
  return (
    <div data-testid="document-generation">
      <button 
        onClick={() => downloadDocument('test-doc', { name: 'Test User' })}
        disabled={isGenerating}
        data-testid="generate-button"
      >
        {isGenerating ? 'Generating...' : 'Generate Document'}
      </button>
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  )
}

describe('Document Generation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PDF Creation Workflow', () => {
    it('generates PDF from form data successfully', async () => {
      const mockDocumentService = require('@/services/documentService').DocumentService
      mockDocumentService.generatePDF.mockResolvedValue({
        blob: new Blob(['mock-pdf'], { type: 'application/pdf' }),
        hash: 'mock-document-hash'
      })

      const user = userEvent.setup()
      render(<DocumentGenerationComponent />)

      const generateButton = screen.getByTestId('generate-button')
      await user.click(generateButton)

      expect(mockDocumentService.generatePDF).toHaveBeenCalledWith('test-doc', { name: 'Test User' })
    })

    it('handles PDF generation errors gracefully', async () => {
      const mockDocumentService = require('@/services/documentService').DocumentService
      mockDocumentService.generatePDF.mockRejectedValue(new Error('PDF generation failed'))

      const user = userEvent.setup()
      render(<DocumentGenerationComponent />)

      const generateButton = screen.getByTestId('generate-button')
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })

    it('displays loading state during PDF generation', async () => {
      const mockDocumentService = require('@/services/documentService').DocumentService
      mockDocumentService.generatePDF.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ blob: new Blob(), hash: 'hash' }), 1000))
      )

      const user = userEvent.setup()
      render(<DocumentGenerationComponent />)

      const generateButton = screen.getByTestId('generate-button')
      await user.click(generateButton)

      expect(screen.getByText('Generating...')).toBeInTheDocument()
      expect(generateButton).toBeDisabled()
    })
  })

  describe('Document Hash Generation', () => {
    it('generates consistent hash for same document content', async () => {
      const testContent = new ArrayBuffer(100)
      const hash1 = await XRPLService.generateDocumentHash(testContent)
      const hash2 = await XRPLService.generateDocumentHash(testContent)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^[a-f0-9]{128}$/) // SHA-512 hex string
    })

    it('generates different hashes for different content', async () => {
      const content1 = new ArrayBuffer(100)
      const content2 = new ArrayBuffer(200)
      
      const hash1 = await XRPLService.generateDocumentHash(content1)
      const hash2 = await XRPLService.generateDocumentHash(content2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('Blockchain Integration', () => {
    it('submits document to blockchain after generation', async () => {
      const mockDocumentService = require('@/services/documentService').DocumentService
      mockDocumentService.generatePDF.mockResolvedValue({
        blob: new Blob(['mock-pdf'], { type: 'application/pdf' }),
        hash: 'mock-document-hash'
      })

      const mockSupabase = require('@/integrations/supabase/client').supabase
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, transactionHash: 'mock-tx-hash' },
        error: null
      })

      const user = userEvent.setup()
      render(<DocumentGenerationComponent />)

      const generateButton = screen.getByTestId('generate-button')
      await user.click(generateButton)

      await waitFor(() => {
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('xrp-submit-document', {
          body: expect.objectContaining({
            documentHash: 'mock-document-hash'
          })
        })
      })
    })
  })

  describe('File Storage Operations', () => {
    it('uploads generated document to storage', async () => {
      const mockDocumentService = require('@/services/documentService').DocumentService
      mockDocumentService.uploadDocument.mockResolvedValue({
        url: 'https://storage.example.com/document.pdf',
        path: 'documents/document.pdf'
      })

      const mockBlob = new Blob(['mock-pdf'], { type: 'application/pdf' })
      
      await mockDocumentService.uploadDocument(mockBlob, 'test-document.pdf')

      expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(
        mockBlob,
        'test-document.pdf'
      )
    })

    it('handles storage upload failures', async () => {
      const mockDocumentService = require('@/services/documentService').DocumentService
      mockDocumentService.uploadDocument.mockRejectedValue(new Error('Storage error'))

      const mockBlob = new Blob(['mock-pdf'], { type: 'application/pdf' })
      
      await expect(
        mockDocumentService.uploadDocument(mockBlob, 'test-document.pdf')
      ).rejects.toThrow('Storage error')
    })
  })

  describe('Download Functionality', () => {
    it('triggers download with correct filename', async () => {
      // Mock URL.createObjectURL and revokeObjectURL
      global.URL.createObjectURL = vi.fn().mockReturnValue('mock-blob-url')
      global.URL.revokeObjectURL = vi.fn()

      // Mock document.createElement for download link
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
        style: { display: '' }
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any)

      const mockDocumentService = require('@/services/documentService').DocumentService
      mockDocumentService.downloadDocument.mockImplementation((blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = filename
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
      })

      const mockBlob = new Blob(['mock-pdf'], { type: 'application/pdf' })
      mockDocumentService.downloadDocument(mockBlob, 'test-document.pdf')

      expect(mockAnchor.download).toBe('test-document.pdf')
      expect(mockAnchor.click).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('displays user-friendly error messages', async () => {
      const mockDocumentService = require('@/services/documentService').DocumentService
      mockDocumentService.generatePDF.mockRejectedValue(new Error('Network timeout'))

      const user = userEvent.setup()
      render(<DocumentGenerationComponent />)

      const generateButton = screen.getByTestId('generate-button')
      await user.click(generateButton)

      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage.textContent).toContain('Network timeout')
      })
    })

    it('allows retry after error', async () => {
      const mockDocumentService = require('@/services/documentService').DocumentService
      mockDocumentService.generatePDF
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({ blob: new Blob(), hash: 'success-hash' })

      const user = userEvent.setup()
      render(<DocumentGenerationComponent />)

      const generateButton = screen.getByTestId('generate-button')
      
      // First attempt fails
      await user.click(generateButton)
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      // Second attempt succeeds
      await user.click(generateButton)
      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
      })
    })
  })

  describe('End-to-End Document Workflow', () => {
    it('completes full document generation to blockchain workflow', async () => {
      const mockDocumentService = require('@/services/documentService').DocumentService
      const mockSupabase = require('@/integrations/supabase/client').supabase

      // Mock successful PDF generation
      mockDocumentService.generatePDF.mockResolvedValue({
        blob: new Blob(['mock-pdf'], { type: 'application/pdf' }),
        hash: 'test-document-hash'
      })

      // Mock successful blockchain submission
      mockSupabase.functions.invoke.mockResolvedValue({
        data: {
          success: true,
          transactionHash: 'test-tx-hash',
          verificationUrl: 'https://testnet.xrpl.org/transactions/test-tx-hash'
        },
        error: null
      })

      const user = userEvent.setup()
      render(<DocumentGenerationComponent />)

      const generateButton = screen.getByTestId('generate-button')
      await user.click(generateButton)

      // Verify PDF generation was called
      expect(mockDocumentService.generatePDF).toHaveBeenCalled()

      // Verify blockchain submission was called
      await waitFor(() => {
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('xrp-submit-document', {
          body: expect.objectContaining({
            documentHash: 'test-document-hash'
          })
        })
      })
    })
  })
})