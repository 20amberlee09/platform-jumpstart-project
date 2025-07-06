import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  overview_title: string;
  overview_subtitle: string;
  overview_description: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Module {
  id: string;
  course_id: string;
  name: string;
  description: string;
  component: string;
  required: boolean;
  order_index: number;
  icon: string;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export const useAdminData = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  const checkAdminStatus = async () => {
    if (!user) {
      console.log('🔍 Admin check: No user logged in');
      setIsAdmin(false);
      return false;
    }
    
    console.log('🔍 Admin check: Checking admin status for user:', user.id, 'email:', user.email);
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      console.log('🔍 Admin check: Query result:', { 
        data, 
        error, 
        userId: user.id,
        userEmail: user.email 
      });
      
      if (error) {
        console.error('🔍 Admin check: Database error:', error);
        setIsAdmin(false);
        return false;
      }
      
      // Check if user has admin role in the returned data
      const hasAdminRole = data && Array.isArray(data) && data.some(role => role.role === 'admin');
      setIsAdmin(hasAdminRole);
      console.log('🔍 Admin check: Final admin status:', hasAdminRole, 'for user:', user.email);
      
      return hasAdminRole;
    } catch (error) {
      console.error('🔍 Admin check: Exception occurred:', error);
      setIsAdmin(false);
      return false;
    }
  };

  // Fetch all courses
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching courses:', error);
      return;
    }
    
    setCourses(data || []);
  };

  // Fetch all modules
  const fetchModules = async () => {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('course_id, order_index');
      
    if (error) {
      console.error('Error fetching modules:', error);
      return;
    }
    
    setModules(data || []);
  };

  // Fetch user roles (admin only)
  const fetchUserRoles = async () => {
    if (!isAdmin) return;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user roles:', error);
      return;
    }
    
    setUserRoles(data || []);
  };

  // Create or update course
  const saveCourse = async (courseData: any) => {
    if (courseData.id) {
      // Update existing course
      const { id, ...updateData } = courseData;
      const { error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
    } else {
      // Create new course
      const { error } = await supabase
        .from('courses')
        .insert([courseData]);
        
      if (error) throw error;
    }
    
    await fetchCourses();
  };

  // Create or update module
  const saveModule = async (moduleData: any) => {
    if (moduleData.id) {
      // Update existing module
      const { id, ...updateData } = moduleData;
      const { error } = await supabase
        .from('modules')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
    } else {
      // Create new module
      const { error } = await supabase
        .from('modules')
        .insert([moduleData]);
        
      if (error) throw error;
    }
    
    await fetchModules();
  };

  // Delete course
  const deleteCourse = async (courseId: string) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
      
    if (error) throw error;
    await fetchCourses();
  };

  // Delete module
  const deleteModule = async (moduleId: string) => {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId);
      
    if (error) throw error;
    await fetchModules();
  };

  // Make user admin
  const makeUserAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .upsert([{ user_id: userId, role: 'admin' }]);
      
    if (error) throw error;
    await fetchUserRoles();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      console.log('🔍 Loading admin data for user:', user?.email);
      
      const isAdminUser = await checkAdminStatus();
      console.log('🔍 Admin status determined:', isAdminUser);
      
      await fetchCourses();
      await fetchModules();
      
      // Fetch user roles only if admin
      if (isAdminUser) {
        await fetchUserRoles();
      }
      
      setLoading(false);
      console.log('🔍 Admin data loading complete');
    };

    if (user) {
      loadData();
    } else {
      // Clear admin status when user signs out
      console.log('🔍 User signed out, clearing admin status');
      setIsAdmin(false);
      setUserRoles([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchUserRoles();
    }
  }, [isAdmin]);

  return {
    courses,
    modules,
    userRoles,
    isAdmin,
    loading,
    saveCourse,
    saveModule,
    deleteCourse,
    deleteModule,
    makeUserAdmin,
    refreshData: async () => {
      await fetchCourses();
      await fetchModules();
      if (isAdmin) await fetchUserRoles();
    }
  };
};