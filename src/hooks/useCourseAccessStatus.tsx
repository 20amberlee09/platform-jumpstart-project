import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface CourseAccessStatus {
  status: 'checking' | 'no-access' | 'has-access' | 'error';
  accessMethod: 'none' | 'payment' | 'gift-code';
  accessDetails: any | null;
  error: string | null;
}

/**
 * Hook to check and manage course access status
 * Centralizes access logic for consistency across components
 */
export const useCourseAccessStatus = (courseId: string) => {
  const { user } = useAuth();
  const [accessStatus, setAccessStatus] = useState<CourseAccessStatus>({
    status: 'checking',
    accessMethod: 'none',
    accessDetails: null,
    error: null
  });

  const checkAccess = useCallback(async () => {
    if (!user || !courseId) {
      setAccessStatus({
        status: 'no-access',
        accessMethod: 'none',
        accessDetails: null,
        error: null
      });
      return;
    }

    try {
      setAccessStatus(prev => ({ ...prev, status: 'checking', error: null }));
      
      // Check for paid orders first
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'paid')
        .maybeSingle();
      
      if (orderError && orderError.code !== 'PGRST116') {
        throw orderError;
      }
      
      if (orderData) {
        setAccessStatus({
          status: 'has-access',
          accessMethod: 'payment',
          accessDetails: orderData,
          error: null
        });
        return;
      }
      
      // Check for redeemed gift codes
      const { data: giftData, error: giftError } = await supabase
        .from('gift_codes')
        .select('*')
        .eq('used_by', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
        
      if (giftError && giftError.code !== 'PGRST116') {
        throw giftError;
      }
        
      if (giftData) {
        setAccessStatus({
          status: 'has-access',
          accessMethod: 'gift-code',
          accessDetails: giftData,
          error: null
        });
        return;
      }
      
      // No access found
      setAccessStatus({
        status: 'no-access',
        accessMethod: 'none',
        accessDetails: null,
        error: null
      });
      
    } catch (error: any) {
      console.error('Error checking course access:', error);
      setAccessStatus({
        status: 'error',
        accessMethod: 'none',
        accessDetails: null,
        error: error.message || 'Failed to check course access'
      });
    }
  }, [user, courseId]);

  // Auto-check on mount and when dependencies change
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Refresh access status (useful after payment/gift code redemption)
  const refreshAccess = useCallback(() => {
    checkAccess();
  }, [checkAccess]);

  // Convenience getters
  const hasAccess = accessStatus.status === 'has-access';
  const isLoading = accessStatus.status === 'checking';
  const hasError = accessStatus.status === 'error';
  const isPaidAccess = hasAccess && accessStatus.accessMethod === 'payment';
  const isGiftAccess = hasAccess && accessStatus.accessMethod === 'gift-code';

  return {
    ...accessStatus,
    hasAccess,
    isLoading,
    hasError,
    isPaidAccess,
    isGiftAccess,
    refreshAccess,
    checkAccess
  };
};