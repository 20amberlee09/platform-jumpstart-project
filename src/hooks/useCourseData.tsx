import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

export interface CourseConfig {
  id: string;
  title: string;
  description: string;
  price: number;
  overview: {
    title: string;
    subtitle: string;
    description: string;
  };
  features: string[];
  modules: Array<{
    id: string;
    name: string;
    description: string;
    component: string;
    required: boolean;
    order: number;
    icon: string;
  }>;
}

export const useCourseData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courseConfigs, setCourseConfigs] = useState<Record<string, CourseConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        // Fetch courses with retry logic
        let coursesData;
        let modulesData;
        
        try {
          const { data: courseResult, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .eq('is_active', true);

          if (coursesError) throw coursesError;
          coursesData = courseResult;
        } catch (err) {
          console.error('Error fetching courses:', err);
          // Use fallback data if database fails
          coursesData = [{
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            title: 'Boot Camp Documents',
            description: 'Complete ecclesiastic revocable living trust creation',
            price: 150,
            overview_title: 'Boot Camp Documents',
            overview_subtitle: 'Complete trust formation package',
            overview_description: 'Professional ecclesiastic revocable living trust creation with automated legal documentation',
            features: [
              'Complete $150 package - no recurring fees',
              'GUIDED: Government ID upload - you provide, we verify automatically',
              'AUTOMATED: Trust name availability verification',
              'GUIDED: Ministerial ordination certificate upload',
              'AUTOMATED: Ecclesiastic revocable living trust document creation',
              'AUTOMATED: Gmail account setup with proper trust naming convention',
              'AUTOMATED: Google Drive folder creation and organization',
              'AUTOMATED: QR code generation for all documentation'
            ],
            is_active: true
          }];
        }

        // Fetch modules with retry logic
        try {
          const { data: moduleResult, error: modulesError } = await supabase
            .from('modules')
            .select('*')
            .order('order_index');

          if (modulesError) throw modulesError;
          modulesData = moduleResult;
        } catch (err) {
          console.error('Error fetching modules:', err);
          // Use fallback module data
          modulesData = [
            {
              id: '1',
              course_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              name: 'Payment & NDA',
              description: 'Complete payment and review NDA agreement',
              component: 'StepPayment',
              required: true,
              order_index: 1,
              icon: 'CreditCard'
            },
            {
              id: '2', 
              course_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              name: 'Identity Verification',
              description: 'Upload government ID for verification',
              component: 'StepIdentity',
              required: true,
              order_index: 2,
              icon: 'Shield'
            }
          ];
        }

        setCourses(coursesData || []);
        setModules(modulesData || []);

        // Transform data into the expected CourseConfig format
        const configs: Record<string, CourseConfig> = {};
        
        coursesData?.forEach(course => {
          const courseModules = modulesData?.filter(m => m.course_id === course.id) || [];
          
          configs[course.id] = {
            id: course.id,
            title: course.title,
            description: course.description,
            price: course.price, // Price is already in dollars, don't convert
            overview: {
              title: course.overview_title || course.title,
              subtitle: course.overview_subtitle || '',
              description: course.overview_description || course.description,
            },
            features: course.features || [],
            modules: courseModules.map(module => ({
              id: module.id,
              name: module.name,
              description: module.description,
              component: module.component,
              required: module.required,
              order: module.order_index,
              icon: module.icon,
            })),
          };
        });

        setCourseConfigs(configs);
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course data. Using fallback configuration.');
        
        // Set fallback configuration
        setCourseConfigs({
          'a1b2c3d4-e5f6-7890-abcd-ef1234567890': {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            title: 'Boot Camp Documents',
            description: 'Complete ecclesiastic revocable living trust creation',
            price: 150,
            overview: {
              title: 'Boot Camp Documents',
              subtitle: 'Complete trust formation package',
              description: 'Professional ecclesiastic revocable living trust creation with automated legal documentation',
            },
            features: [
              'Complete $150 package - no recurring fees',
              'GUIDED: Government ID upload - you provide, we verify automatically',
              'AUTOMATED: Trust name availability verification'
            ],
            modules: []
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    courses,
    modules,
    courseConfigs,
    loading,
    error,
  };
};