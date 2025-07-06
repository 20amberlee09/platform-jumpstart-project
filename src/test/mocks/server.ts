import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server for Node.js environment (Vitest)
export const server = setupServer(...handlers)

// Optional: Configure server for different environments
export const setupMockServer = (additionalHandlers = []) => {
  return setupServer(...handlers, ...additionalHandlers)
}

// Browser setup (for Storybook or browser tests)
export const setupMockBrowser = async () => {
  if (typeof window !== 'undefined') {
    const { setupWorker } = await import('msw/browser')
    const worker = setupWorker(...handlers)
    
    return {
      start: () => worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      }),
      stop: () => worker.stop(),
      resetHandlers: () => worker.resetHandlers(),
      use: (...newHandlers: any[]) => worker.use(...newHandlers)
    }
  }
  
  return null
}