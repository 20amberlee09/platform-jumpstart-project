import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface EnhancedStepData {
  // Existing step data
  [key: string]: any;
  
  // Minister verification data
  ministerVerification?: {
    isOrdained: boolean;
    certificateUploaded: boolean;
    certificateUrl?: string;
    ministerName?: string;
    verificationDate?: string;
  };
  
  // Verification tools data
  verificationTools?: {
    barcodeUploaded: boolean;
    barcodeUrl?: string;
    trustEmail?: string;
    googleDriveUrl?: string;
    verificationStatus: {
      barcode: boolean;
      email: boolean;
      drive: boolean;
    };
  };
  
  // Document generation data
  documentGeneration?: {
    templatesSelected: string[];
    personalInfoComplete: boolean;
    documentsGenerated: boolean;
    generatedUrls: string[];
    blockchainHash?: string;
    verificationQR?: string;
  };
}

interface UserProgress {
  id?: string;
  user_id: string;
  course_id: string;
  current_step: number;
  completed_steps: number[];
  step_data: EnhancedStepData;
  is_complete: boolean;
  minister_status?: {
    verified: boolean;
    name: string | null;
    certificate_url: string | null;
  };
}

export const useUserProgress = (courseId: string) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Load progress from database
  const loadProgress = useCallback(async () => {
    if (!user || !courseId) return;

    try {
      setLoading(true);
      
      // Get user progress with minister status
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      // Get minister status
      const { data: ministerData } = await supabase
        .rpc('get_minister_status', { user_uuid: user.id });

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      const ministerStatus = ministerData?.[0] || {
        is_minister: false,
        minister_name: null,
        certificate_url: null
      };

      if (progressData) {
        setProgress({
          ...progressData,
          step_data: (progressData.step_data as EnhancedStepData) || {},
          completed_steps: progressData.completed_steps || [],
          is_complete: progressData.is_complete || false,
          minister_status: {
            verified: ministerStatus.is_minister,
            name: ministerStatus.minister_name,
            certificate_url: ministerStatus.certificate_url
          }
        });
      } else {
        // Create initial progress
        const initialProgress: UserProgress = {
          user_id: user.id,
          course_id: courseId,
          current_step: 1,
          completed_steps: [],
          step_data: {},
          is_complete: false,
          minister_status: {
            verified: ministerStatus.is_minister,
            name: ministerStatus.minister_name,
            certificate_url: ministerStatus.certificate_url
          }
        };
        setProgress(initialProgress);
      }
    } catch (error: any) {
      console.error('Error loading progress:', error);
      toast({
        title: "Error Loading Progress",
        description: error.message || "Failed to load your progress",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, courseId, toast]);

  // Save progress to database with debouncing
  const saveProgress = useCallback(async (progressData: UserProgress, immediate = false) => {
    if (!user || saving) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const performSave = async () => {
      try {
        setSaving(true);
        
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: progressData.user_id,
            course_id: progressData.course_id,
            current_step: progressData.current_step,
            completed_steps: progressData.completed_steps,
            step_data: progressData.step_data,
            is_complete: progressData.is_complete,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,course_id'
          });

        if (error) throw error;

        setLastSaved(new Date());
        
        // Show save indicator (only for manual saves)
        if (immediate) {
          toast({
            title: "Progress Saved",
            description: "Your progress has been saved successfully",
          });
        }
      } catch (error: any) {
        console.error('Error saving progress:', error);
        toast({
          title: "Save Error",
          description: error.message || "Failed to save progress",
          variant: "destructive"
        });
      } finally {
        setSaving(false);
      }
    };

    if (immediate) {
      await performSave();
    } else {
      // Debounced save (1 second delay)
      saveTimeoutRef.current = setTimeout(performSave, 1000);
    }
  }, [user, saving, toast]);

  // Update progress and trigger auto-save
  const updateProgress = useCallback((updates: Partial<UserProgress>) => {
    if (!progress) return;

    const updatedProgress = { ...progress, ...updates };
    setProgress(updatedProgress);
    saveProgress(updatedProgress);
  }, [progress, saveProgress]);

  // Save step-specific data
  const saveStepData = useCallback(async (stepKey: string, data: any) => {
    if (!progress) return;

    const updatedStepData = {
      ...progress.step_data,
      [stepKey]: data
    };

    const updatedProgress = {
      ...progress,
      step_data: updatedStepData
    };

    setProgress(updatedProgress);
    await saveProgress(updatedProgress);
  }, [progress, saveProgress]);

  // Get step-specific data
  const getStepData = useCallback((stepKey: string) => {
    return progress?.step_data?.[stepKey] || null;
  }, [progress]);

  // Complete current step and advance
  const completeStep = useCallback(async (stepNumber?: number) => {
    if (!progress) return;

    const currentStep = stepNumber || progress.current_step;
    const completedSteps = [...progress.completed_steps];
    
    if (!completedSteps.includes(currentStep)) {
      completedSteps.push(currentStep);
    }

    const updatedProgress = {
      ...progress,
      current_step: currentStep + 1,
      completed_steps: completedSteps
    };

    setProgress(updatedProgress);
    await saveProgress(updatedProgress, true);
  }, [progress, saveProgress]);

  // Go to specific step
  const goToStep = useCallback(async (stepNumber: number) => {
    if (!progress) return;

    const updatedProgress = {
      ...progress,
      current_step: stepNumber
    };

    setProgress(updatedProgress);
    await saveProgress(updatedProgress, true);
  }, [progress, saveProgress]);

  // Check if step is accessible
  const isStepAccessible = useCallback((stepNumber: number) => {
    if (!progress) return false;
    
    // Step 1 is always accessible
    if (stepNumber === 1) return true;
    
    // Check if previous step is completed
    return progress.completed_steps.includes(stepNumber - 1);
  }, [progress]);

  // Get minister verification status
  const getMinisterStatus = useCallback(() => {
    return progress?.minister_status || {
      verified: false,
      name: null,
      certificate_url: null
    };
  }, [progress]);

  // Update minister status in progress
  const updateMinisterStatus = useCallback(async () => {
    if (!user || !progress) return;

    try {
      const { data: ministerData } = await supabase
        .rpc('get_minister_status', { user_uuid: user.id });

      const ministerStatus = ministerData?.[0] || {
        is_minister: false,
        minister_name: null,
        certificate_url: null
      };

      const updatedProgress = {
        ...progress,
        minister_status: {
          verified: ministerStatus.is_minister,
          name: ministerStatus.minister_name,
          certificate_url: ministerStatus.certificate_url
        }
      };

      setProgress(updatedProgress);
    } catch (error) {
      console.error('Error updating minister status:', error);
    }
  }, [user, progress]);

  // Calculate completion percentage
  const getCompletionPercentage = useCallback(() => {
    if (!progress) return 0;
    
    const totalSteps = 10; // Adjust based on your total workflow steps
    const completedCount = progress.completed_steps.length;
    return Math.round((completedCount / totalSteps) * 100);
  }, [progress]);

  // Backward compatibility methods for existing components
  const workflowState = progress ? {
    courseId: progress.course_id,
    currentStep: progress.current_step,
    completedSteps: progress.completed_steps,
    stepData: progress.step_data,
    isComplete: progress.is_complete
  } : null;

  const goBackStep = useCallback(() => {
    if (!progress) return;
    const previousStep = Math.max(1, progress.current_step - 1);
    goToStep(previousStep);
  }, [progress, goToStep]);

  const markComplete = useCallback(() => {
    if (!progress) return;
    updateProgress({ is_complete: true });
  }, [progress, updateProgress]);

  const updateStepData = useCallback((stepKey: string, data: any) => {
    saveStepData(stepKey, data);
  }, [saveStepData]);

  // Load progress on component mount and user change
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    progress,
    loading,
    saving,
    lastSaved,
    updateProgress,
    saveStepData,
    getStepData,
    completeStep,
    goToStep,
    isStepAccessible,
    getMinisterStatus,
    updateMinisterStatus,
    getCompletionPercentage,
    loadProgress,
    // Backward compatibility
    workflowState,
    goBackStep,
    markComplete,
    updateStepData
  };
};
