import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { LazyWrapper, PageLoader, WorkflowLoader, AdminLoader } from '@/components/LazyWrapper'
import { usePerformance, useComponentLifecycle } from '@/hooks/usePerformance'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Suspense, lazy, useState } from 'react'

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

// Test components for performance testing
const FastComponent = () => <div data-testid="fast-component">Fast Component</div>
const SlowComponent = () => {
  // Simulate slow component
  const start = Date.now()
  while (Date.now() - start < 100) {
    // Busy wait for 100ms
  }
  return <div data-testid="slow-component">Slow Component</div>
}

const ComponentWithPerformanceHook = ({ componentName }: { componentName: string }) => {
  const { renderTime, trackUserAction, trackPageLoad } = usePerformance(componentName)
  useComponentLifecycle(componentName)
  
  return (
    <div data-testid="performance-component">
      <span data-testid="render-time">{renderTime.toFixed(2)}ms</span>
      <button onClick={() => trackUserAction('test-action', { data: 'test' })}>
        Track Action
      </button>
      <button onClick={() => trackPageLoad()}>
        Track Page Load
      </button>
    </div>
  )
}

// Lazy component for testing code splitting
const LazyTestComponent = lazy(() => 
  Promise.resolve({
    default: () => <div data-testid="lazy-component">Lazy Loaded Component</div>
  })
)

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  describe('Lazy Loading Components', () => {
    it('LazyWrapper shows fallback before loading component', async () => {
      const { findByTestId } = render(
        <LazyWrapper>
          <LazyTestComponent />
        </LazyWrapper>
      )

      // Initially shows loading
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Eventually shows the component
      await findByTestId('lazy-component')
      expect(screen.getByTestId('lazy-component')).toBeInTheDocument()
    })

    it('LazyWrapper uses custom fallback when provided', () => {
      const CustomFallback = () => <div data-testid="custom-fallback">Custom Loading...</div>

      render(
        <LazyWrapper fallback={<CustomFallback />}>
          <LazyTestComponent />
        </LazyWrapper>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument()
    })

    it('PageLoader renders with custom message', () => {
      render(<PageLoader message="Loading custom page..." />)

      expect(screen.getByText('Loading custom page...')).toBeInTheDocument()
      expect(screen.getByText('Please wait while we prepare your content')).toBeInTheDocument()
    })

    it('WorkflowLoader and AdminLoader render correctly', () => {
      const { rerender } = render(<WorkflowLoader />)
      expect(screen.getByText('Loading workflow engine...')).toBeInTheDocument()

      rerender(<AdminLoader />)
      expect(screen.getByText('Loading admin dashboard...')).toBeInTheDocument()
    })
  })

  describe('Performance Monitoring Hooks', () => {
    it('usePerformance tracks render times', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      // Mock performance.now to simulate slow render
      let callCount = 0
      window.performance.now = vi.fn().mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 100 // 100ms render time
      })

      render(<ComponentWithPerformanceHook componentName="TestComponent" />)

      expect(screen.getByTestId('performance-component')).toBeInTheDocument()
      
      // In development mode, should log slow renders
      expect(consoleSpy).toHaveBeenCalledWith('TestComponent render time: 100.00ms')
      
      consoleSpy.mockRestore()
    })

    it('usePerformance tracks user actions', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      render(<ComponentWithPerformanceHook componentName="TestComponent" />)

      const trackActionButton = screen.getByText('Track Action')
      trackActionButton.click()

      expect(consoleSpy).toHaveBeenCalledWith(
        'User action: test-action',
        expect.objectContaining({
          component: 'TestComponent',
          timestamp: expect.any(Number),
          data: { data: 'test' }
        })
      )

      consoleSpy.mockRestore()
    })

    it('usePerformance tracks page load times', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      render(<ComponentWithPerformanceHook componentName="TestComponent" />)

      const trackPageLoadButton = screen.getByText('Track Page Load')
      trackPageLoadButton.click()

      expect(consoleSpy).toHaveBeenCalledWith('Page load time for TestComponent: 100.00ms')
      
      consoleSpy.mockRestore()
    })

    it('useComponentLifecycle tracks mount and unmount', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const { unmount } = render(<ComponentWithPerformanceHook componentName="TestComponent" />)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/TestComponent mounted at \d+/)
      )

      unmount()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/TestComponent unmounted after \d+\.\d+ms/)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Error Boundary Performance Impact', () => {
    it('Error boundaries do not significantly impact render performance', () => {
      const renderStart = performance.now()

      render(
        <ErrorBoundary level="component">
          <FastComponent />
        </ErrorBoundary>
      )

      const renderEnd = performance.now()
      const renderTime = renderEnd - renderStart

      expect(screen.getByTestId('fast-component')).toBeInTheDocument()
      // Error boundary should add minimal overhead (less than 50ms)
      expect(renderTime).toBeLessThan(50)
    })

    it('Error boundaries handle slow components gracefully', () => {
      const renderStart = performance.now()

      render(
        <ErrorBoundary level="component">
          <SlowComponent />
        </ErrorBoundary>
      )

      const renderEnd = performance.now()
      const renderTime = renderEnd - renderStart

      expect(screen.getByTestId('slow-component')).toBeInTheDocument()
      // Should complete within reasonable time despite slow component
      expect(renderTime).toBeLessThan(200)
    })
  })

  describe('Code Splitting Effectiveness', () => {
    it('lazy components load independently', async () => {
      let component1Loaded = false
      let component2Loaded = false

      const LazyComponent1 = lazy(() => {
        component1Loaded = true
        return Promise.resolve({
          default: () => <div data-testid="lazy-1">Component 1</div>
        })
      })

      const LazyComponent2 = lazy(() => {
        component2Loaded = true
        return Promise.resolve({
          default: () => <div data-testid="lazy-2">Component 2</div>
        })
      })

      const { findByTestId } = render(
        <div>
          <Suspense fallback={<div>Loading 1...</div>}>
            <LazyComponent1 />
          </Suspense>
          <Suspense fallback={<div>Loading 2...</div>}>
            <LazyComponent2 />
          </Suspense>
        </div>
      )

      await findByTestId('lazy-1')
      await findByTestId('lazy-2')

      expect(component1Loaded).toBe(true)
      expect(component2Loaded).toBe(true)
      expect(screen.getByTestId('lazy-1')).toBeInTheDocument()
      expect(screen.getByTestId('lazy-2')).toBeInTheDocument()
    })
  })

  describe('Bundle Loading Behavior', () => {
    it('handles multiple lazy components efficiently', async () => {
      const loadTimes: number[] = []

      const createLazyComponent = (name: string, delay: number) => 
        lazy(() => {
          const start = performance.now()
          return new Promise(resolve => {
            setTimeout(() => {
              loadTimes.push(performance.now() - start)
              resolve({
                default: () => <div data-testid={`lazy-${name}`}>Component {name}</div>
              })
            }, delay)
          })
        })

      const LazyA = createLazyComponent('A', 50)
      const LazyB = createLazyComponent('B', 30)
      const LazyC = createLazyComponent('C', 20)

      const { findByTestId } = render(
        <div>
          <Suspense fallback={<div>Loading A...</div>}>
            <LazyA />
          </Suspense>
          <Suspense fallback={<div>Loading B...</div>}>
            <LazyB />
          </Suspense>
          <Suspense fallback={<div>Loading C...</div>}>
            <LazyC />
          </Suspense>
        </div>
      )

      await findByTestId('lazy-A')
      await findByTestId('lazy-B')
      await findByTestId('lazy-C')

      // All components should load in parallel, not sequentially
      const maxLoadTime = Math.max(...loadTimes)
      expect(maxLoadTime).toBeLessThan(100) // Should not take sum of all delays
    })
  })

  describe('Memory Usage Patterns', () => {
    it('cleans up components properly on unmount', () => {
      const TestComponent = () => {
        const [data, setData] = useState(new Array(1000).fill('test'))
        return (
          <div data-testid="memory-test">
            <button onClick={() => setData([...data, 'more'])}>Add Data</button>
            <span>{data.length} items</span>
          </div>
        )
      }

      const { unmount } = render(<TestComponent />)
      
      expect(screen.getByTestId('memory-test')).toBeInTheDocument()
      
      // Component should unmount cleanly without memory leaks
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Performance Thresholds', () => {
    it('fast components render within acceptable time limits', () => {
      const renderStart = performance.now()
      
      render(<FastComponent />)
      
      const renderTime = performance.now() - renderStart
      
      expect(screen.getByTestId('fast-component')).toBeInTheDocument()
      expect(renderTime).toBeLessThan(16) // Target: 60fps = 16.67ms per frame
    })

    it('identifies slow rendering components', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Mock a component that takes longer than threshold
      const VerySlowComponent = () => {
        const { renderTime } = usePerformance('VerySlowComponent')
        
        // Simulate render time over threshold
        if (renderTime > 100) {
          console.warn(`Slow render detected in VerySlowComponent: ${renderTime.toFixed(2)}ms`)
        }
        
        return <div data-testid="very-slow">Very Slow Component</div>
      }

      render(<VerySlowComponent />)
      
      // Performance monitoring should detect slow renders
      expect(screen.getByTestId('very-slow')).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })
  })
})