import { useEffect, useRef, useState } from 'react';

export const usePerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - renderStartTime.current;
    setRenderTime(duration);
    
    if (import.meta.env.DEV && duration > 50) {
      console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
    }
  });

  const trackUserAction = (action: string, data?: any) => {
    if (import.meta.env.PROD) {
      // Track performance-impacting user actions
      const actionTime = performance.now();
      console.log(`User action: ${action}`, { 
        component: componentName, 
        timestamp: actionTime,
        data 
      });
    }
  };

  const trackPageLoad = () => {
    if (typeof window !== 'undefined') {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const pageLoadTime = navigationEntry.loadEventEnd - navigationEntry.loadEventStart;
      
      if (import.meta.env.DEV) {
        console.log(`Page load time for ${componentName}: ${pageLoadTime.toFixed(2)}ms`);
      }
      
      return pageLoadTime;
    }
    return 0;
  };

  return {
    renderTime,
    trackUserAction,
    trackPageLoad
  };
};

// Hook for tracking component mount/unmount
export const useComponentLifecycle = (componentName: string) => {
  useEffect(() => {
    const mountTime = performance.now();
    console.log(`${componentName} mounted at ${mountTime}`);
    
    return () => {
      const unmountTime = performance.now();
      const lifespan = unmountTime - mountTime;
      console.log(`${componentName} unmounted after ${lifespan.toFixed(2)}ms`);
    };
  }, [componentName]);
};