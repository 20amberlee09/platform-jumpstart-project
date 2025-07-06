import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useCourseData } from '@/hooks/useCourseData';
import { CourseConfig, WorkflowState } from '@/types/course';
import StepIndicator from './StepIndicator';
import { moduleRegistry } from './moduleRegistry';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowEngineProps {
  courseId: string;
  onComplete?: () => void;
}

const WorkflowEngine = ({ courseId, onComplete }: WorkflowEngineProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courseConfigs, loading: courseLoading } = useCourseData();
  const courseConfig = courseConfigs[courseId];
  const [hasCourseAccess, setHasCourseAccess] = useState(true); // Assume access initially
  const { 
    workflowState, 
    loading, 
    saving, 
    completeStep, 
    goBackStep, 
    markComplete,
    updateStepData
  } = useUserProgress(courseId);

  // Check course access on mount
  useEffect(() => {
    const checkCourseAccess = async () => {
      if (!user) return;
      
      try {
        // Check for paid orders
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .eq('status', 'paid')
          .maybeSingle();
        
        if (orderData) {
          setHasCourseAccess(true);
          return;
        }
        
        // Check for redeemed gift codes
        const { data: giftData } = await supabase
          .from('gift_codes')
          .select('*')
          .eq('used_by', user.id)
          .eq('course_id', courseId)
          .maybeSingle();
          
        setHasCourseAccess(!!giftData);
      } catch (error) {
        console.error('Error checking course access:', error);
        setHasCourseAccess(false);
      }
    };
    
    checkCourseAccess();
  }, [user, courseId]);

  // Show loading state while progress or course data loads
  if (loading || courseLoading) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {courseLoading ? 'Loading course...' : 'Loading your progress...'}
          </p>
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
  
  // All modules are available - let StepPayment handle access logic internally
  const availableModules = sortedModules;
  
  // Convert 1-based step to 0-based index for array access
  const currentStepIndex = Math.max(0, workflowState.currentStep - 1);
  const currentModule = availableModules[currentStepIndex];
  const stepNames = availableModules.map(module => module.name);

  const handleStepComplete = (stepData?: any) => {
    // Save step data first if provided
    if (stepData && updateStepData) {
      updateStepData(`step_${workflowState.currentStep}`, stepData);
    }
    
    // Complete the current step (no parameter needed - uses current step)
    completeStep();
    
    // Check if this was the last step (current step is 1-based, array length is count)
    if (workflowState.currentStep >= availableModules.length) {
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
          currentStep={currentStepIndex} 
          completedSteps={workflowState.completedSteps} 
        />
        
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default WorkflowEngine;