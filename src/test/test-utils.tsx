import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'

// Mock auth context
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MockAuthProvider>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </MockAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data generators
export const generateMockCourse = (overrides = {}) => ({
  id: 'test-course-id',
  title: 'Test Course',
  description: 'Test course description',
  price: 15000,
  is_active: true,
  features: ['Feature 1', 'Feature 2'],
  overview_title: 'Test Overview',
  overview_subtitle: 'Test Subtitle',
  overview_description: 'Test overview description',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const generateMockModule = (overrides = {}) => ({
  id: 'test-module-id',
  course_id: 'test-course-id',
  name: 'test-module',
  title: 'Test Module',
  description: 'Test module description',
  component: 'TestComponent',
  order_index: 0,
  required: true,
  icon: 'TestIcon',
  content: {},
  templates: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const generateMockUserProgress = (overrides = {}) => ({
  id: 'test-progress-id',
  user_id: 'test-user-id',
  course_id: 'test-course-id',
  current_step: 0,
  completed_steps: [],
  is_complete: false,
  step_data: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const generateMockOrder = (overrides = {}) => ({
  id: 'test-order-id',
  user_id: 'test-user-id',
  course_id: 'test-course-id',
  amount: 15000,
  currency: 'usd',
  status: 'completed',
  stripe_session_id: 'test-session-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const generateMockGiftCode = (overrides = {}) => ({
  id: 'test-gift-code-id',
  code: 'TEST-GIFT-CODE',
  course_id: 'test-course-id',
  created_by: 'test-admin-id',
  used_by: null,
  used_at: null,
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

// Custom queries for common testing patterns
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Mock navigation function
export const mockNavigate = vi.fn()

// Mock location
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
}

// Auth test helpers
export const mockAuthenticatedUser = () => {
  vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    },
    session: {
      access_token: 'mock-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com'
      }
    },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn()
  })
}

export const mockUnauthenticatedUser = () => {
  vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
    user: null,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn()
  })
}

export const mockAdminUser = () => {
  vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
    isAdmin: true,
    loading: false
  })
}

export const mockRegularUser = () => {
  vi.mocked(require('@/hooks/useAdminData').useAdminData).mockReturnValue({
    isAdmin: false,
    loading: false
  })
}

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  await waitForLoadingToFinish()
  const end = performance.now()
  return end - start
}

// Error simulation utilities
export const simulateNetworkError = () => {
  const error = new Error('Network Error')
  error.name = 'NetworkError'
  return error
}

export const simulateAuthError = () => {
  const error = new Error('Authentication Error')
  error.name = 'AuthError'
  return error
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { screen, fireEvent, waitFor }
export { customRender as render }
export { default as userEvent } from '@testing-library/user-event'