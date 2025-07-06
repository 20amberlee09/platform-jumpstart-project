import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Simple test component to validate testing setup
const TestComponent = () => {
  return (
    <div>
      <h1 data-testid="title">Testing Setup Validation</h1>
      <button data-testid="test-button" onClick={() => console.log('clicked')}>
        Click Me
      </button>
      <input data-testid="test-input" placeholder="Type here" />
    </div>
  )
}

describe('Testing Infrastructure Validation', () => {
  describe('Basic Rendering', () => {
    it('can render a simple component', () => {
      render(<TestComponent />)
      
      expect(screen.getByTestId('title')).toBeInTheDocument()
      expect(screen.getByText('Testing Setup Validation')).toBeInTheDocument()
    })

    it('can find elements by role', () => {
      render(<TestComponent />)
      
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('can handle button clicks with fireEvent', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      render(<TestComponent />)
      
      const button = screen.getByTestId('test-button')
      fireEvent.click(button)
      
      expect(consoleSpy).toHaveBeenCalledWith('clicked')
      consoleSpy.mockRestore()
    })

    it('can handle user events with userEvent', async () => {
      const user = userEvent.setup()
      render(<TestComponent />)
      
      const input = screen.getByTestId('test-input')
      await user.type(input, 'test input')
      
      expect(input).toHaveValue('test input')
    })
  })

  describe('Async Operations', () => {
    it('can handle async operations with waitFor', async () => {
      const AsyncComponent = () => {
        const [text, setText] = React.useState('Loading...')
        
        React.useEffect(() => {
          setTimeout(() => setText('Loaded!'), 100)
        }, [])
        
        return <div data-testid="async-text">{text}</div>
      }
      
      render(<AsyncComponent />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText('Loaded!')).toBeInTheDocument()
      })
    })
  })

  describe('Testing Library Exports', () => {
    it('validates all essential testing utilities are available', () => {
      // These should all be available without throwing errors
      expect(screen).toBeDefined()
      expect(fireEvent).toBeDefined()
      expect(waitFor).toBeDefined()
      expect(userEvent).toBeDefined()
      expect(render).toBeDefined()
    })
  })
})