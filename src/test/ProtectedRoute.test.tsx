import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { BrowserRouter } from 'react-router-dom'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate-to">{to}</div>,
    useLocation: () => ({ pathname: '/protected', search: '' })
  }
})

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('@/hooks/useAdminData', () => ({
  useAdminData: vi.fn()
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}))

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication Loading', () => {
    it('shows loading spinner while checking authentication', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: true
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByText('Verifying access...')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
    })

    it('shows loading spinner while checking admin status', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { id: 'test-user' },
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: true
      })

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByText('Verifying access...')).toBeInTheDocument()
    })
  })

  describe('Unauthenticated Access', () => {
    it('redirects unauthenticated users to auth page', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/auth?returnUrl=%2Fprotected')
    })

    it('uses custom redirect URL', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute redirectTo="/custom-auth">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/custom-auth?returnUrl=%2Fprotected')
    })
  })

  describe('Authenticated Access', () => {
    it('renders protected content for authenticated users', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  describe('Admin Role Requirements', () => {
    it('allows admin users to access admin-required routes', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { id: 'admin-user', email: 'admin@example.com' },
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: true,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute requiredRole="admin">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('denies regular users access to admin routes', async () => {
      const mockToast = vi.fn()
      vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({
        toast: mockToast
      })

      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { id: 'regular-user', email: 'user@example.com' },
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute requiredRole="admin">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/')
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive"
        })
      })
    })
  })

  describe('User Role Access', () => {
    it('allows authenticated users to access user-level routes', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute requiredRole="user">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('defaults to user role when no role specified', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  describe('Course Access Requirements', () => {
    it('handles course access requirement flag', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { id: 'test-user', email: 'test@example.com' },
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute requireCourseAccess={true}>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      // For now, assume all authenticated users have access
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  describe('Return URL Preservation', () => {
    it('preserves query parameters in return URL', () => {
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          Navigate: ({ to }: { to: string }) => <div data-testid="navigate-to">{to}</div>,
          useLocation: () => ({ pathname: '/protected', search: '?param=value' })
        }
      })

      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/auth?returnUrl=%2Fprotected%3Fparam%3Dvalue')
    })
  })

  describe('Edge Cases', () => {
    it('handles null user gracefully', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('navigate-to')).toBeInTheDocument()
    })

    it('handles admin check with null user', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: false
      })
      
      vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
        isAdmin: false,
        loading: false
      })

      render(
        <BrowserRouter>
          <ProtectedRoute requiredRole="admin">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      // Should redirect to auth, not attempt admin check
      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/auth?returnUrl=%2Fprotected')
    })
  })
})