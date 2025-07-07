import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  key: string;
  data: any;
  debounceMs?: number;
  enabled?: boolean;
}

export const useAutoSave = ({ key, data, debounceMs = 1000, enabled = true }: UseAutoSaveOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isInitialRef = useRef(true);

  const saveData = useCallback(async (dataToSave: any) => {
    if (!user || !enabled) return;

    try {
      const dataString = JSON.stringify(dataToSave);
      
      // Don't save if data hasn't changed
      if (dataString === lastSavedRef.current) return;

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          course_id: 'trust-course', // Default course ID
          step_key: key,
          step_data: dataToSave,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      lastSavedRef.current = dataString;
      
      console.log(`Auto-saved ${key}:`, dataToSave);
      
      // Show save confirmation (not on initial load)
      if (!isInitialRef.current) {
        toast({
          title: "Progress Saved",
          description: `Your ${key} information has been saved automatically.`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error(`Auto-save failed for ${key}:`, error);
      toast({
        title: "Save Failed",
        description: "Your progress could not be saved. Please check your connection.",
        variant: "destructive",
      });
    }
  }, [user, key, enabled, toast]);

  // Debounced auto-save
  useEffect(() => {
    if (!data || !user || !enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      saveData(data);
      isInitialRef.current = false;
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveData, debounceMs]);

  // Load saved data on mount
  const loadSavedData = useCallback(async () => {
    if (!user || !enabled) return null;

    try {
      const { data: savedData, error } = await supabase
        .from('user_progress')
        .select('step_data')
        .eq('user_id', user.id)
        .eq('step_key', key)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return savedData?.step_data || null;
    } catch (error) {
      console.error(`Failed to load saved data for ${key}:`, error);
      return null;
    }
  }, [user, key, enabled]);

  return { saveData, loadSavedData };
};