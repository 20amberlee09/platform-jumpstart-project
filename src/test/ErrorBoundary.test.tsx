import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, CriticalErrorBoundary, PageErrorBoundary } from '@/components/ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage)
  }
  return <div data-testid="working-component">Component works!</div>
}

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Component Level Error Boundary', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary level="component">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('working-component')).toBeInTheDocument()
      expect(screen.getByText('Component works!')).toBeInTheDocument()
    })

    it('displays component error UI when error occurs', () => {
      render(
        <ErrorBoundary level="component">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Component Error')).toBeInTheDocument()
      expect(screen.getByText('This component failed to load.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('allows retry after component error', () => {
      const { rerender } = render(
        <ErrorBoundary level="component">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Component Error')).toBeInTheDocument()

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)

      // Re-render with no error
      rerender(
        <ErrorBoundary level="component">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('working-component')).toBeInTheDocument()
    })
  })

  describe('Page Level Error Boundary', () => {
    it('displays page error UI for page-level errors', () => {
      render(
        <ErrorBoundary level="page">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Page Error')).toBeInTheDocument()
      expect(screen.getByText('This page encountered an error. You can try again or return to the previous page.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
    })

    it('handles go back button click', () => {
      const mockHistoryBack = vi.fn()
      window.history.back = mockHistoryBack

      render(
        <ErrorBoundary level="page">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const goBackButton = screen.getByRole('button', { name: /go back/i })
      fireEvent.click(goBackButton)

      expect(mockHistoryBack).toHaveBeenCalled()
    })
  })

  describe('Critical Level Error Boundary', () => {
    it('displays critical error UI for system-level errors', () => {
      render(
        <ErrorBoundary level="critical">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('System Error')).toBeInTheDocument()
      expect(screen.getByText('A critical error occurred. Please try reloading the page.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
    })

    it('handles reload page button click', () => {
      const mockReload = vi.fn()
      Object.defineProperty(window.location, 'reload', {
        value: mockReload,
        writable: true
      })

      render(
        <ErrorBoundary level="critical">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const reloadButton = screen.getByRole('button', { name: /reload page/i })
      fireEvent.click(reloadButton)

      expect(mockReload).toHaveBeenCalled()
    })

    it('handles go home button click', () => {
      const mockAssign = vi.fn()
      Object.defineProperty(window.location, 'href', {
        set: mockAssign,
        configurable: true
      })

      render(
        <ErrorBoundary level="critical">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const goHomeButton = screen.getByRole('button', { name: /go home/i })
      fireEvent.click(goHomeButton)

      expect(mockAssign).toHaveBeenCalledWith('/')
    })
  })

  describe('Error Logging and Reporting', () => {
    it('logs error information to console in development', () => {
      const consoleSpy = vi.spyOn(console, 'error')
      
      render(
        <ErrorBoundary level="component">
          <ThrowError shouldThrow={true} errorMessage="Detailed test error" />
        </ErrorBoundary>
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error Boundary caught an error:',
        expect.objectContaining({
          error: 'Detailed test error',
          level: 'component',
          errorId: expect.stringMatching(/^error_\d+_\w+$/)
        })
      )
    })

    it('stores error reports in localStorage for debugging', () => {
      render(
        <ErrorBoundary level="component">
          <ThrowError shouldThrow={true} errorMessage="Storage test error" />
        </ErrorBoundary>
      )

      const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]')
      expect(storedErrors).toHaveLength(1)
      expect(storedErrors[0]).toMatchObject({
        message: 'Storage test error',
        url: 'http://localhost:3000',
        timestamp: expect.any(String)
      })
    })

    it('limits stored error reports to 10 entries', () => {
      // Generate 12 errors to test the limit
      for (let i = 0; i < 12; i++) {
        render(
          <ErrorBoundary level="component">
            <ThrowError shouldThrow={true} errorMessage={`Error ${i}`} />
          </ErrorBoundary>
        )
      }

      const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]')
      expect(storedErrors).toHaveLength(10)
      expect(storedErrors[0].message).toBe('Error 2') // First two should be removed
      expect(storedErrors[9].message).toBe('Error 11') // Last one should be present
    })
  })

  describe('Development vs Production Error Display', () => {
    it('shows error details in development mode', () => {
      // Mock development environment
      vi.stubEnv('DEV', true)
      
      render(
        <ErrorBoundary level="critical">
          <ThrowError shouldThrow={true} errorMessage="Dev mode error" />
        </ErrorBoundary>
      )

      expect(screen.getByText('Error: Dev mode error')).toBeInTheDocument()
      expect(screen.getByText(/ID: error_/)).toBeInTheDocument()
    })

    it('hides error details in production mode', () => {
      // Mock production environment
      vi.stubEnv('DEV', false)
      vi.stubEnv('PROD', true)
      
      render(
        <ErrorBoundary level="critical">
          <ThrowError shouldThrow={true} errorMessage="Prod mode error" />
        </ErrorBoundary>
      )

      expect(screen.queryByText('Error: Prod mode error')).not.toBeInTheDocument()
      expect(screen.queryByText(/ID: error_/)).not.toBeInTheDocument()
    })
  })

  describe('Custom Fallback Component', () => {
    it('renders custom fallback when provided', () => {
      const CustomFallback = () => <div data-testid="custom-fallback">Custom Error UI</div>

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
    })
  })

  describe('Convenience Components', () => {
    it('CriticalErrorBoundary works as expected', () => {
      render(
        <CriticalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </CriticalErrorBoundary>
      )

      expect(screen.getByText('System Error')).toBeInTheDocument()
    })

    it('PageErrorBoundary works as expected', () => {
      render(
        <PageErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PageErrorBoundary>
      )

      expect(screen.getByText('Page Error')).toBeInTheDocument()
    })
  })
})