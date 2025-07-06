import { Suspense, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export const LazyWrapper = ({ children, fallback, className }: LazyWrapperProps) => {
  const defaultFallback = (
    <div className={`flex items-center justify-center min-h-[400px] ${className || ''}`}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// Enhanced loading component for heavy pages
export const PageLoader = ({ message = "Loading page..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4 p-8">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">{message}</h3>
        <p className="text-sm text-muted-foreground mt-1">Please wait while we prepare your content</p>
      </div>
    </div>
  </div>
);

// Component-specific loaders
export const WorkflowLoader = () => (
  <PageLoader message="Loading workflow engine..." />
);

export const AdminLoader = () => (
  <PageLoader message="Loading admin dashboard..." />
);

export const DocumentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-y-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-sm">Generating document...</span>
    </div>
  </div>
);