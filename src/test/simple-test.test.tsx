import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple validation test to check if testing library exports work
describe('Testing Library Validation', () => {
  it('should import and use screen correctly', () => {
    const TestComponent = () => <div data-testid="test">Hello Test</div>
    
    render(<TestComponent />)
    
    const element = screen.getByTestId('test')
    expect(element).toBeInTheDocument()
  })
})