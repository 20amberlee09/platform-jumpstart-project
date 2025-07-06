import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId } = this.state;
    
    console.error('Error Boundary caught an error:', {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component'
    });
    
    this.setState({ errorInfo });
    
    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo, errorId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo, errorId?: string) => {
    // TODO: Integrate with Sentry or similar service
    const errorReport = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // For now, store in localStorage for debugging
    const existingErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
    existingErrors.push(errorReport);
    localStorage.setItem('error_reports', JSON.stringify(existingErrors.slice(-10))); // Keep last 10
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;
      const { error, errorId } = this.state;

      // Critical error - full page
      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="space-y-2">
                <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
                <h1 className="text-2xl font-bold text-foreground">System Error</h1>
                <p className="text-muted-foreground">
                  A critical error occurred. Please try reloading the page.
                </p>
              </div>
              
              {import.meta.env.DEV && (
                <div className="text-left bg-muted p-3 rounded text-sm">
                  <strong>Error:</strong> {error?.message}
                  <br />
                  <strong>ID:</strong> {errorId}
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                <Button onClick={this.handleReload} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Page error - contained
      if (level === 'page') {
        return (
          <div className="min-h-[400px] flex items-center justify-center p-8">
            <div className="text-center space-y-4 max-w-md">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Page Error</h2>
                <p className="text-muted-foreground">
                  This page encountered an error. You can try again or return to the previous page.
                </p>
              </div>
              
              <div className="flex space-x-2 justify-center">
                <Button onClick={this.handleRetry} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Component error - minimal
      return (
        <div className="border border-destructive/20 rounded-lg p-4 m-2">
          <div className="flex items-center space-x-2 text-destructive">
            <Bug className="h-4 w-4" />
            <span className="text-sm font-medium">Component Error</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            This component failed to load.
          </p>
          <Button 
            onClick={this.handleRetry} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience HOCs
export const withErrorBoundary = (
  Component: React.ComponentType<any>, 
  level: 'page' | 'component' | 'critical' = 'component'
) => {
  return (props: any) => (
    <ErrorBoundary level={level}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Specific error boundaries
export const PageErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary level="page">{children}</ErrorBoundary>
);

export const CriticalErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary level="critical">{children}</ErrorBoundary>
);