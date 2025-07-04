import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { CourseConfig, WorkflowState } from '@/types/course';
import { courseConfigs } from '@/config/courses';
import StepIndicator from './StepIndicator';
import { moduleRegistry } from './moduleRegistry';
import { Button } from '@/components/ui/button';

interface WorkflowEngineProps {
  courseId: string;
  onComplete?: () => void;
}

const WorkflowEngine = ({ courseId, onComplete }: WorkflowEngineProps) => {
  const { user } = useAuth();
  const { isDemoMode, getDummyData } = useDemoMode();
  const navigate = useNavigate();
  const courseConfig = courseConfigs[courseId];
  
  const [workflowState, setWorkflowState] = useState<WorkflowState>(() => {
    const initialStepData = isDemoMode ? {
      'step-identity': getDummyData('step-identity'),
      'step-nda': getDummyData('step-nda'),
      'step-trust-name': getDummyData('step-trust-name'),
      'step-trust-config': getDummyData('step-trust-config'),
      'step-ordination': getDummyData('step-ordination'),
      'step-gmail-setup': getDummyData('step-gmail-setup'),
      'step-verification-tools': getDummyData('step-verification-tools'),
      'step-document-assembly': getDummyData('step-document-assembly'),
      'step-document-generation': getDummyData('step-document-generation'),
      'step-signatures': getDummyData('step-signatures'),
      'step-payment': getDummyData('step-payment'),
      'step-review': getDummyData('step-review')
    } : {};

    return {
      courseId,
      currentStep: 0,
      completedSteps: [],
      stepData: initialStepData,
      isComplete: false
    };
  });

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
    const newStepData = { ...workflowState.stepData };
    if (stepData) {
      newStepData[currentModule.id] = stepData;
    }

    const newCompletedSteps = [...workflowState.completedSteps, workflowState.currentStep];
    const nextStep = workflowState.currentStep + 1;
    const isComplete = nextStep >= sortedModules.length;

    setWorkflowState({
      ...workflowState,
      currentStep: nextStep,
      completedSteps: newCompletedSteps,
      stepData: newStepData,
      isComplete
    });

    if (isComplete && onComplete) {
      onComplete();
    }
  };

  const handleStepBack = () => {
    if (workflowState.currentStep > 0) {
      setWorkflowState({
        ...workflowState,
        currentStep: workflowState.currentStep - 1
      });
    }
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