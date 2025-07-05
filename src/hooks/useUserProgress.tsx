import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WorkflowState } from '@/types/course';
import { useToast } from '@/hooks/use-toast';

interface UserProgress {
  id?: string;
  user_id: string;
  course_id: string;
  current_step: number;
  completed_steps: number[];
  step_data: Record<string, any>;
  is_complete: boolean;
}

export const useUserProgress = (courseId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    courseId,
    currentStep: 0,
    completedSteps: [],
    stepData: {},
    isComplete: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user progress from database
  const loadProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        setWorkflowState({
          courseId,
          currentStep: data.current_step,
          completedSteps: data.completed_steps || [],
          stepData: (data.step_data as Record<string, any>) || {},
          isComplete: data.is_complete
        });
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast({
        title: "Error loading progress",
        description: "Starting fresh. Your progress will be saved as you go.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, courseId, toast]);

  // Save progress to database
  const saveProgress = useCallback(async (state: WorkflowState) => {
    if (!user) return;

    setSaving(true);
    try {
      const progressData: Omit<UserProgress, 'id'> = {
        user_id: user.id,
        course_id: courseId,
        current_step: state.currentStep,
        completed_steps: state.completedSteps,
        step_data: state.stepData,
        is_complete: state.isComplete
      };

      const { error } = await supabase
        .from('user_progress')
        .upsert(progressData, {
          onConflict: 'user_id,course_id'
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error saving progress",
        description: "Your progress may not be saved. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [user, courseId, toast]);

  // Auto-save with debouncing
  useEffect(() => {
    if (!loading && user) {
      const timeoutId = setTimeout(() => {
        saveProgress(workflowState);
      }, 1000); // Save 1 second after changes stop

      return () => clearTimeout(timeoutId);
    }
  }, [workflowState, loading, user, saveProgress]);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Update workflow state
  const updateState = useCallback((newState: Partial<WorkflowState>) => {
    setWorkflowState(prev => ({ ...prev, ...newState }));
  }, []);

  // Complete a step
  const completeStep = useCallback((stepData?: any) => {
    setWorkflowState(prev => {
      const newStepData = { ...prev.stepData };
      if (stepData) {
        newStepData[`step_${prev.currentStep}`] = stepData;
      }

      const newCompletedSteps = [...prev.completedSteps];
      if (!newCompletedSteps.includes(prev.currentStep)) {
        newCompletedSteps.push(prev.currentStep);
      }

      const nextStep = prev.currentStep + 1;
      
      return {
        ...prev,
        currentStep: nextStep,
        completedSteps: newCompletedSteps,
        stepData: newStepData,
        isComplete: false // Will be updated separately when workflow is complete
      };
    });
  }, []);

  // Go back a step
  const goBackStep = useCallback(() => {
    setWorkflowState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  }, []);

  // Mark workflow as complete
  const markComplete = useCallback(() => {
    setWorkflowState(prev => ({
      ...prev,
      isComplete: true
    }));
  }, []);

  // Update step data without advancing
  const updateStepData = useCallback((stepKey: string, data: any) => {
    setWorkflowState(prev => ({
      ...prev,
      stepData: {
        ...prev.stepData,
        [stepKey]: data
      }
    }));
  }, []);

  return {
    workflowState,
    loading,
    saving,
    updateState,
    completeStep,
    goBackStep,
    markComplete,
    updateStepData,
    saveProgress: () => saveProgress(workflowState)
  };
};