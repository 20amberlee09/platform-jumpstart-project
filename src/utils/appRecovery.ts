/**
 * App Recovery Utilities
 * Helps recover from various application errors and ensures user journey completion
 */

import { supabase } from '@/integrations/supabase/client';

export const appRecovery = {
  /**
   * Clear problematic localStorage data that might cause issues
   */
  clearProblematicStorage: () => {
    try {
      // Clear any problematic cache or state
      const keysToCheck = ['pendingOrderId', 'pendingCourseId', 'authStateCache'];
      keysToCheck.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          console.log(`Clearing potentially problematic storage key: ${key}`);
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  /**
   * Recover user access by checking all possible access methods
   */
  async recoverUserAccess(userId: string, courseId: string = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') {
    try {
      // Check for paid orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('status', 'paid');

      if (orders && orders.length > 0) {
        return { hasAccess: true, method: 'order', data: orders[0] };
      }

      // Check for gift codes
      const { data: giftCodes } = await supabase
        .from('gift_codes')
        .select('*')
        .eq('used_by', userId)
        .eq('course_id', courseId);

      if (giftCodes && giftCodes.length > 0) {
        return { hasAccess: true, method: 'giftCode', data: giftCodes[0] };
      }

      return { hasAccess: false, method: null, data: null };
    } catch (error) {
      console.error('Error recovering user access:', error);
      return { hasAccess: false, method: null, data: null };
    }
  },

  /**
   * Force refresh application state
   */
  forceRefresh: () => {
    try {
      // Clear all localStorage except essential auth data
      const authKeys = Object.keys(localStorage).filter(key => key.includes('supabase.auth'));
      const authData: Record<string, string> = {};
      
      authKeys.forEach(key => {
        authData[key] = localStorage.getItem(key) || '';
      });
      
      localStorage.clear();
      
      // Restore auth data
      Object.entries(authData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      // Force page reload
      window.location.reload();
    } catch (error) {
      console.error('Error during force refresh:', error);
      window.location.reload();
    }
  },

  /**
   * Safe navigation with fallbacks
   */
  safeNavigate: (path: string, navigate?: (path: string) => void) => {
    try {
      if (navigate) {
        navigate(path);
      } else {
        window.location.href = path;
      }
    } catch (error) {
      console.error('Navigation error, using fallback:', error);
      window.location.href = path;
    }
  },

  /**
   * Check if app is in a problematic state
   */
  async diagnoseAppState() {
    const issues = [];

    // Check for network connectivity
    try {
      const { data } = await supabase.from('courses').select('count');
      if (!data) {
        issues.push('Database connectivity issue');
      }
    } catch (error) {
      issues.push('Network or database error');
    }

    // Check for auth state
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        issues.push('Authentication session missing');
      }
    } catch (error) {
      issues.push('Authentication error');
    }

    return {
      hasIssues: issues.length > 0,
      issues,
      timestamp: new Date().toISOString()
    };
  }
};

export default appRecovery;