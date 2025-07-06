import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, screen, fireEvent } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import WorkflowEngine from '@/components/workflow/WorkflowEngine'
import { useUserProgress } from '@/hooks/useUserProgress'

// Mock the workflow components
vi.mock('@/components/workflow/StepIdentity', () => ({
  default: () => <div data-testid="step-identity">Identity Step</div>
}))

vi.mock('@/components/workflow/StepOrdination', () => ({
  default: () => <div data-testid="step-ordination">Ordination Step</div>
}))

vi.mock('@/components/workflow/StepNDA', () => ({
  default: () => <div data-testid="step-nda">NDA Step</div>
}))

// Mock user progress hook
vi.mock('@/hooks/useUserProgress', () => ({
  useUserProgress: vi.fn()
}))

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}))

const mockProgressData = {
  id: 'progress-123',
  user_id: 'user-123',
  course_id: 'course-123',
  current_step: 0,
  completed_steps: [],
  step_data: {},
  is_complete: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

describe('Workflow Engine Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    vi.mocked(useUserProgress).mockReturnValue({
      progress: mockProgressData,
      loading: false,
      saving: false,
      lastSaved: new Date(),
      updateProgress: vi.fn(),
      saveStepData: vi.fn(),
      completeStep: vi.fn(),
      goToStep: vi.fn(),
      hasAccess: vi.fn(),
      resetProgress: vi.fn(),
      exportProgress: vi.fn(),
      importProgress: vi.fn(),
      getStepData: vi.fn(),
      updateStepData: vi.fn()
    })
  })

  describe('Step Progression Logic', () => {
    it('renders current step correctly', () => {
      render(<WorkflowEngine courseId="test-course" />)
      
      expect(screen.getByTestId('step-identity')).toBeInTheDocument()
      expect(screen.queryByTestId('step-ordination')).not.toBeInTheDocument()
    })

    it('progresses to next step when current step is completed', async () => {
      const mockCompleteStep = vi.fn()
      vi.mocked(useUserProgress).mockReturnValue({
        progress: { ...mockProgressData, currentStep: 1, completedSteps: [0] },
        updateProgress: vi.fn(),
        completeStep: mockCompleteStep,
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      expect(screen.getByTestId('step-ordination')).toBeInTheDocument()
      expect(screen.queryByTestId('step-identity')).not.toBeInTheDocument()
    })

    it('allows backward navigation to completed steps', async () => {
      const mockUpdateProgress = vi.fn()
      vi.mocked(useUserProgress).mockReturnValue({
        progress: { ...mockProgressData, current_step: 2, completed_steps: [0, 1] },
        updateProgress: mockUpdateProgress,
        completeStep: vi.fn(),
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      // Find back button and click it
      const backButton = screen.getByRole('button', { name: /back/i })
      const user = userEvent.setup()
      await user.click(backButton)

      expect(mockUpdateProgress).toHaveBeenCalledWith(
        expect.objectContaining({ current_step: 1 })
      )
    })
  })

  describe('Data Persistence', () => {
    it('saves step data when progressing', async () => {
      const mockUpdateProgress = vi.fn()
      vi.mocked(useUserProgress).mockReturnValue({
        progress: mockProgressData,
        updateProgress: mockUpdateProgress,
        completeStep: vi.fn(),
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      // Simulate form data entry and step completion
      const testData = { fullName: 'Test User', email: 'test@example.com' }
      
      // This would typically be triggered by the step component
      // Simulate step completion with data
      const completeStepWithData = () => {
        mockUpdateProgress({
          currentStep: 1,
          completedSteps: [0],
          stepData: { identity: testData }
        })
      }
      
      completeStepWithData()

      expect(mockUpdateProgress).toHaveBeenCalledWith({
        current_step: 1,
        completed_steps: [0],
        step_data: { identity: testData }
      })
    })

    it('retains data when navigating backward', () => {
      const persistedData = {
        ...mockProgressData,
        current_step: 1,
        completed_steps: [0],
        step_data: { identity: { fullName: 'Test User' } }
      }

      vi.mocked(useUserProgress).mockReturnValue({
        progress: persistedData,
        updateProgress: vi.fn(),
        completeStep: vi.fn(),
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      // Data should be preserved in the progress state
      expect(screen.getByTestId('step-ordination')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('prevents progression with invalid step data', async () => {
      const mockCompleteStep = vi.fn()
      vi.mocked(useUserProgress).mockReturnValue({
        progress: mockProgressData,
        updateProgress: vi.fn(),
        completeStep: mockCompleteStep,
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      // Try to progress without completing required fields
      const nextButton = screen.getByRole('button', { name: /next/i })
      const user = userEvent.setup()
      await user.click(nextButton)

      // Should not progress if validation fails
      expect(mockCompleteStep).not.toHaveBeenCalled()
    })

    it('validates required fields before step completion', async () => {
      const mockCompleteStep = vi.fn()
      vi.mocked(useUserProgress).mockReturnValue({
        progress: mockProgressData,
        updateProgress: vi.fn(),
        completeStep: mockCompleteStep,
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      // Fill in required fields (this would be handled by the step component)
      const validData = { 
        fullName: 'John Doe', 
        email: 'john@example.com',
        phone: '123-456-7890'
      }

      // Simulate valid form submission
      const nextButton = screen.getByRole('button', { name: /next/i })
      const user = userEvent.setup()
      await user.click(nextButton)

      // With valid data, step should complete
      expect(mockCompleteStep).toHaveBeenCalledWith(0, validData)
    })
  })

  describe('Auto-save Functionality', () => {
    it('automatically saves progress during form input', async () => {
      const mockUpdateProgress = vi.fn()
      vi.mocked(useUserProgress).mockReturnValue({
        progress: mockProgressData,
        updateProgress: mockUpdateProgress,
        completeStep: vi.fn(),
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      // Simulate form input with debounced auto-save
      const formInput = screen.getByLabelText(/full name/i)
      const user = userEvent.setup()
      await user.type(formInput, 'John Doe')

      // Auto-save should trigger after debounce delay
      await waitFor(() => {
        expect(mockUpdateProgress).toHaveBeenCalledWith(
          expect.objectContaining({
            stepData: expect.objectContaining({
              identity: expect.objectContaining({
                fullName: 'John Doe'
              })
            })
          })
        )
      }, { timeout: 2000 })
    })
  })

  describe('Minister Verification Integration', () => {
    it('handles minister verification workflow step', async () => {
      vi.mocked(useUserProgress).mockReturnValue({
        progress: { 
          ...mockProgressData, 
          currentStep: 3, 
          completedSteps: [0, 1, 2],
          stepData: { 
            identity: { ministerName: 'Rev. John Doe' },
            ordination: { verified: true }
          }
        },
        updateProgress: vi.fn(),
        completeStep: vi.fn(),
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      // Should show minister verification step
      expect(screen.getByText(/minister/i)).toBeInTheDocument()
    })

    it('requires minister verification before document generation', () => {
      vi.mocked(useUserProgress).mockReturnValue({
        progress: { 
          ...mockProgressData, 
          currentStep: 4,
          completedSteps: [0, 1, 2, 3],
          stepData: { 
            identity: { ministerName: 'Rev. John Doe' },
            ordination: { verified: false }
          }
        },
        updateProgress: vi.fn(),
        completeStep: vi.fn(),
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      // Should show verification pending message
      expect(screen.getByText(/verification pending/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('displays error messages for step failures', () => {
      vi.mocked(useUserProgress).mockReturnValue({
        progress: mockProgressData,
        updateProgress: vi.fn(),
        completeStep: vi.fn(),
        loading: false,
        error: 'Failed to save progress'
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      expect(screen.getByText(/failed to save progress/i)).toBeInTheDocument()
    })

    it('handles network errors during step transitions', async () => {
      const mockCompleteStep = vi.fn().mockRejectedValue(new Error('Network error'))
      vi.mocked(useUserProgress).mockReturnValue({
        progress: mockProgressData,
        updateProgress: vi.fn(),
        completeStep: mockCompleteStep,
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      const user = userEvent.setup()
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Complete Workflow Journey', () => {
    it('completes entire workflow from start to finish', async () => {
      const mockCompleteStep = vi.fn()
      let currentStep = 0
      const steps = ['identity', 'ordination', 'nda', 'verification', 'documents']

      // Mock progressive completion
      vi.mocked(useUserProgress).mockImplementation(() => ({
        progress: {
          currentStep,
          completedSteps: Array.from({ length: currentStep }, (_, i) => i),
          stepData: {},
          isComplete: currentStep >= steps.length
        },
        updateProgress: vi.fn(),
        completeStep: vi.fn().mockImplementation(() => {
          currentStep++
        }),
        loading: false,
        error: null
      }))

      const { rerender } = render(<WorkflowEngine courseId="test-course" />)
      
      const user = userEvent.setup()

      // Progress through each step
      for (let i = 0; i < steps.length; i++) {
        const nextButton = screen.getByRole('button', { name: /next/i })
        await user.click(nextButton)
        
        rerender(<WorkflowEngine courseId="test-course" />)
        
        if (i < steps.length - 1) {
          expect(screen.getByTestId(`step-${steps[i + 1]}`)).toBeInTheDocument()
        }
      }

      // Should show completion
      expect(screen.getByText(/workflow complete/i)).toBeInTheDocument()
    })
  })

  describe('Step Accessibility', () => {
    it('disables future steps that are not accessible', () => {
      vi.mocked(useUserProgress).mockReturnValue({
        progress: { ...mockProgressData, currentStep: 1, completedSteps: [0] },
        updateProgress: vi.fn(),
        completeStep: vi.fn(),
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      // Future steps should not be directly accessible
      const stepIndicators = screen.getAllByRole('button', { name: /step \d+/i })
      const futureSteps = stepIndicators.slice(2) // Steps beyond current + 1
      
      futureSteps.forEach(step => {
        expect(step).toBeDisabled()
      })
    })

    it('allows access to completed steps', () => {
      vi.mocked(useUserProgress).mockReturnValue({
        progress: { ...mockProgressData, currentStep: 2, completedSteps: [0, 1] },
        updateProgress: vi.fn(),
        completeStep: vi.fn(),
        loading: false,
        error: null
      })

      render(<WorkflowEngine courseId="test-course" />)
      
      // Completed steps should be accessible
      const stepIndicators = screen.getAllByRole('button', { name: /step \d+/i })
      const completedSteps = stepIndicators.slice(0, 2)
      
      completedSteps.forEach(step => {
        expect(step).not.toBeDisabled()
      })
    })
  })
})