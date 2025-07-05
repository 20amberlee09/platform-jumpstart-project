import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const AutoAdminSetup = () => {
  const { user } = useAuth();

  useEffect(() => {
    const setupFirstAdmin = async () => {
      if (!user) return;

      try {
        // Check if any admin users exist
        const { data: existingAdmins, error: adminCheckError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('role', 'admin')
          .limit(1);

        if (adminCheckError) {
          console.error('Error checking for existing admins:', adminCheckError);
          return;
        }

        // If no admins exist, make this user an admin
        if (!existingAdmins || existingAdmins.length === 0) {
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert([{ user_id: user.id, role: 'admin' }]);

          if (insertError) {
            console.error('Error creating first admin:', insertError);
          } else {
            console.log('First admin user created successfully');
          }
        }
      } catch (error) {
        console.error('Error in auto admin setup:', error);
      }
    };

    setupFirstAdmin();
  }, [user]);

  return null; // This component doesn't render anything
};

export default AutoAdminSetup;