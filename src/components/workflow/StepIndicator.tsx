import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
}

const StepIndicator = ({ steps, currentStep, completedSteps }: StepIndicatorProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  completedSteps.includes(index)
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary text-primary"
                    : "border-muted-foreground text-muted-foreground"
                )}
              >
                {completedSteps.includes(index) ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    completedSteps.includes(index)
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-xs mt-2 text-center max-w-20 transition-colors",
                index === currentStep
                  ? "text-primary font-medium"
                  : completedSteps.includes(index)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;