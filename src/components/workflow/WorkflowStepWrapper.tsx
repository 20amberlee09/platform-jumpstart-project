import React, { memo, useCallback, useMemo } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface WorkflowStepWrapperProps {
  children: React.ReactNode;
  stepName: string;
  onNext?: () => void;
  onPrev?: () => void;
  data?: any;
  loading?: boolean;
}

const WorkflowStepWrapperComponent = ({
  children,
  stepName,
  onNext,
  onPrev,
  data,
  loading = false
}: WorkflowStepWrapperProps) => {
  
  // Memoize callbacks to prevent unnecessary re-renders
  const handleNext = useCallback(() => {
    if (loading) return;
    onNext?.();
  }, [onNext, loading]);

  const handlePrev = useCallback(() => {
    if (loading) return;
    onPrev?.();
  }, [onPrev, loading]);

  // Memoize step data to prevent unnecessary re-renders
  const stepData = useMemo(() => data, [data]);

  // Performance monitoring in development
  if (import.meta.env.DEV) {
    React.useEffect(() => {
      const startTime = performance.now();
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        if (renderTime > 100) { // Log slow renders
          console.warn(`Slow render detected in ${stepName}: ${renderTime.toFixed(2)}ms`);
        }
      };
    });
  }

  return (
    <ErrorBoundary level="component">
      <div className="workflow-step" data-step={stepName}>
        {React.cloneElement(children as React.ReactElement, {
          onNext: handleNext,
          onPrev: handlePrev,
          data: stepData,
          loading
        })}
      </div>
    </ErrorBoundary>
  );
};

export const WorkflowStepWrapper = memo(WorkflowStepWrapperComponent);