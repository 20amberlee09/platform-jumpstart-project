import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress } from '@/hooks/useUserProgress';
import { CourseConfig, WorkflowState } from '@/types/course';
import { courseConfigs } from '@/config/courses';
import StepIndicator from './StepIndicator';
import { moduleRegistry } from './moduleRegistry';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface WorkflowEngineProps {
  courseId: string;
  onComplete?: () => void;
}

const WorkflowEngine = ({ courseId, onComplete }: WorkflowEngineProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const courseConfig = courseConfigs[courseId];
  const { 
    workflowState, 
    loading, 
    saving, 
    completeStep, 
    goBackStep, 
    markComplete,
    updateStepData
  } = useUserProgress(courseId);

  // Show loading state while progress loads
  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!courseConfig) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested course configuration could not be found.
          </p>
          <Button onClick={() => navigate('/courses')} variant="outline">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const sortedModules = [...courseConfig.modules].sort((a, b) => a.order - b.order);
  const currentModule = sortedModules[workflowState.currentStep];
  const stepNames = sortedModules.map(module => module.name);

  const handleStepComplete = (stepData?: any) => {
    completeStep(stepData);
    
    // Check if this was the last step
    const nextStep = workflowState.currentStep + 1;
    if (nextStep >= sortedModules.length) {
      markComplete();
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleStepBack = () => {
    goBackStep();
  };

  const renderCurrentStep = () => {
    if (!currentModule) {
      return (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Workflow Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You have successfully completed all steps in the {courseConfig.title} course.
          </p>
          <Button onClick={() => navigate('/courses')} variant="outline">
            Back to Courses
          </Button>
        </div>
      );
    }

    const StepComponent = moduleRegistry[currentModule.component];
    
    if (!StepComponent) {
      return (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Step Under Development</h2>
          <p className="text-muted-foreground mb-6">
            The {currentModule.name} step is currently being developed.
          </p>
          <div className="flex justify-center space-x-4">
            {workflowState.currentStep > 0 && (
              <Button onClick={handleStepBack} variant="outline">
                Back
              </Button>
            )}
            <Button onClick={() => handleStepComplete()} variant="outline">
              Skip for Now
            </Button>
          </div>
        </div>
      );
    }

    return (
      <StepComponent
        onNext={handleStepComplete}
        onPrev={workflowState.currentStep > 0 ? handleStepBack : undefined}
        data={workflowState.stepData}
        courseConfig={courseConfig}
        updateStepData={updateStepData}
        currentStepKey={`step_${workflowState.currentStep}`}
      />
    );
  };

  const handleStartWorkflow = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Workflow is already started, this might be called from overview
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress saving indicator */}
        {saving && (
          <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <Save className="h-4 w-4" />
            <span className="text-sm">Saving progress...</span>
          </div>
        )}
        
        <StepIndicator 
          steps={stepNames} 
          currentStep={workflowState.currentStep} 
          completedSteps={workflowState.completedSteps} 
        />
        
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default WorkflowEngine;