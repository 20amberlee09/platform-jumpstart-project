import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useCourseAccess = (courseId: string = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') => {
  const { user } = useAuth();
  const [hasCourseAccess, setHasCourseAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkCourseAccess = async () => {
    if (!user) {
      setHasCourseAccess(false);
      setLoading(false);
      return;
    }
    
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
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCourseAccess();
  }, [user, courseId]);

  return { hasCourseAccess, loading, refreshAccess: checkCourseAccess };
};