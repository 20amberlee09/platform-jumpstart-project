import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useCourseAccess = (courseId: string = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') => {
  const { user } = useAuth();
  const [hasCourseAccess, setHasCourseAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkCourseAccess = async () => {
    console.log('Checking course access for user:', user?.id, 'courseId:', courseId);
    
    if (!user) {
      console.log('No user found, setting access to false');
      setHasCourseAccess(false);
      setLoading(false);
      return;
    }
    
    try {
      // Check for paid orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'paid')
        .maybeSingle();
      
      console.log('Order check result:', { orderData, orderError });
      
      if (orderData) {
        console.log('Found paid order, granting access');
        setHasCourseAccess(true);
        setLoading(false);
        return;
      }
      
      // Check for redeemed gift codes
      const { data: giftData, error: giftError } = await supabase
        .from('gift_codes')
        .select('*')
        .eq('used_by', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      
      console.log('Gift code check result:', { giftData, giftError });
        
      const hasAccess = !!giftData;
      console.log('Final course access result:', hasAccess);
      setHasCourseAccess(hasAccess);
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