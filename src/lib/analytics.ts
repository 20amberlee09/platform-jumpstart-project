interface PageLoadMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

interface UserInteraction {
  event: string;
  element: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface BusinessMetrics {
  documentGenerated: string;
  stepCompleted: number;
  courseProgress: number;
  conversionFunnel: string;
}

class Analytics {
  private isProduction = import.meta.env.PROD;
  private sessionId: string;
  private userId?: string;
  private startTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = performance.now();
    this.initializePerformanceObserver();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackPerformanceMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.trackPerformanceMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  trackPageLoad(route: string) {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const metrics: PageLoadMetrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstContentfulPaint: this.getFCP(),
      largestContentfulPaint: this.getLCP()
    };

    this.send('page_load', {
      route,
      metrics,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now()
    });
  }

  private getFCP(): number {
    const entries = performance.getEntriesByType('paint');
    const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
    return fcp?.startTime || 0;
  }

  private getLCP(): number {
    const entries = performance.getEntriesByType('largest-contentful-paint');
    return entries.length > 0 ? entries[entries.length - 1].startTime : 0;
  }

  trackUserInteraction(event: string, element: string, metadata?: Record<string, any>) {
    const interaction: UserInteraction = {
      event,
      element,
      timestamp: Date.now(),
      metadata
    };

    this.send('user_interaction', {
      interaction,
      sessionId: this.sessionId,
      userId: this.userId
    });
  }

  trackBusinessMetric(type: keyof BusinessMetrics, value: string | number, metadata?: Record<string, any>) {
    this.send('business_metric', {
      type,
      value,
      metadata,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now()
    });
  }

  trackConversionFunnel(step: string, metadata?: Record<string, any>) {
    this.trackBusinessMetric('conversionFunnel', step, metadata);
  }

  trackDocumentGeneration(documentType: string, success: boolean, metadata?: Record<string, any>) {
    this.trackBusinessMetric('documentGenerated', documentType, {
      success,
      ...metadata
    });
  }

  trackStepCompletion(stepIndex: number, stepName: string, timeSpent: number) {
    this.trackBusinessMetric('stepCompleted', stepIndex, {
      stepName,
      timeSpent,
      sessionDuration: performance.now() - this.startTime
    });
  }

  trackCourseProgress(courseId: string, progressPercentage: number, moduleCount: number) {
    this.trackBusinessMetric('courseProgress', progressPercentage, {
      courseId,
      moduleCount,
      sessionDuration: performance.now() - this.startTime
    });
  }

  trackPerformanceMetric(metric: string, value: number, metadata?: Record<string, any>) {
    this.send('performance_metric', {
      metric,
      value,
      metadata,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now()
    });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.send('error_tracking', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now()
    });
  }

  private send(eventType: string, data: any) {
    if (!this.isProduction) {
      console.log('📊 Analytics Event:', eventType, data);
      return;
    }

    // In production, send to your analytics service
    if (import.meta.env.VITE_ANALYTICS_ID) {
      // Example: Send to your analytics endpoint
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          data,
          analyticsId: import.meta.env.VITE_ANALYTICS_ID,
          appVersion: import.meta.env.VITE_APP_VERSION
        })
      }).catch(err => {
        console.warn('Analytics tracking failed:', err);
      });
    }
  }

  // Dashboard utilities for real-time monitoring
  getSessionMetrics() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      sessionDuration: performance.now() - this.startTime,
      startTime: this.startTime,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };
  }

  getPerformanceSnapshot() {
    return {
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null,
      navigation: performance.getEntriesByType('navigation')[0],
      resources: performance.getEntriesByType('resource').length,
      timestamp: Date.now()
    };
  }
}

export const analytics = new Analytics();

// Convenience functions for common tracking scenarios
export const trackPageView = (route: string) => analytics.trackPageLoad(route);
export const trackClick = (element: string, metadata?: Record<string, any>) => 
  analytics.trackUserInteraction('click', element, metadata);
export const trackFormSubmission = (formName: string, success: boolean) => 
  analytics.trackUserInteraction('form_submit', formName, { success });
export const trackDocumentDownload = (documentType: string) => 
  analytics.trackUserInteraction('download', documentType);