import { supabase } from '@/integrations/supabase/client';

export const sendWelcomeEmail = async (userEmail: string, userName: string, confirmationUrl?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        userEmail,
        userName,
        confirmationUrl
      }
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Welcome email helper error:', error);
    return { success: false, error };
  }
};

export const sendCompletionNotification = async (
  userEmail: string, 
  userName: string, 
  trustName: string, 
  ministerName: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-completion-notification', {
      body: {
        userEmail,
        userName,
        trustName,
        completionDate: new Date().toISOString(),
        ministerName
      }
    });

    if (error) {
      console.error('Error sending completion notification:', error);
      return { success: false, error };
    }

    console.log('Completion notification sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Completion notification helper error:', error);
    return { success: false, error };
  }
};