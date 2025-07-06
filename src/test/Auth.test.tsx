import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import Auth from '@/pages/Auth'
import { supabase } from '@/integrations/supabase/client'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ search: '', pathname: '/auth' })
  }
})

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn()
  }))
}))

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}))

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Login Form', () => {
    it('renders login form by default', () => {
      render(<Auth />)
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<Auth />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      })
    })

    it('validates password requirement', async () => {
      const user = userEvent.setup()
      render(<Auth />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('submits login form with valid data', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn()
      })

      const user = userEvent.setup()
      render(<Auth />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('displays error message on login failure', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ error: { message: 'Invalid credentials' } })
      const mockToast = vi.fn()
      
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn()
      })
      
      vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({
        toast: mockToast
      })

      const user = userEvent.setup()
      render(<Auth />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Invalid credentials',
          variant: 'destructive'
        })
      })
    })
  })

  describe('Registration Form', () => {
    it('switches to registration form', async () => {
      const user = userEvent.setup()
      render(<Auth />)
      
      const signUpLink = screen.getByText(/don't have an account/i).closest('button')
      await user.click(signUpLink!)
      
      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    it('validates full name requirement', async () => {
      const user = userEvent.setup()
      render(<Auth />)
      
      // Switch to sign up
      const signUpLink = screen.getByText(/don't have an account/i).closest('button')
      await user.click(signUpLink!)
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
      })
    })

    it('validates password strength', async () => {
      const user = userEvent.setup()
      render(<Auth />)
      
      // Switch to sign up
      const signUpLink = screen.getByText(/don't have an account/i).closest('button')
      await user.click(signUpLink!)
      
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, '123')
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })

    it('submits registration form with valid data', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn(),
        signUp: mockSignUp,
        signOut: vi.fn()
      })

      const user = userEvent.setup()
      render(<Auth />)
      
      // Switch to sign up
      const signUpLink = screen.getByText(/don't have an account/i).closest('button')
      await user.click(signUpLink!)
      
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      
      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User')
      })
    })
  })

  describe('Return URL Handling', () => {
    it('redirects to return URL after successful login', async () => {
      const mockNavigate = vi.fn()
      
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useNavigate: () => mockNavigate,
          useLocation: () => ({ search: '?returnUrl=%2Fadmin', pathname: '/auth' })
        }
      })

      const mockSignIn = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { id: 'test-user' },
        loading: false,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn()
      })

      render(<Auth />)
      
      // Should redirect when user is present
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true })
      })
    })

    it('redirects to home when no return URL', async () => {
      const mockNavigate = vi.fn()
      
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: { id: 'test-user' },
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn()
      })

      render(<Auth />)
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading spinner during authentication', () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn()
      })

      render(<Auth />)
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('disables form during submission', async () => {
      const mockSignIn = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 1000))
      )
      
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn()
      })

      const user = userEvent.setup()
      render(<Auth />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(submitButton).toBeDisabled()
    })
  })
})