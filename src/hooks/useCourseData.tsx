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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true);

        if (coursesError) throw coursesError;

        // Fetch modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .order('order_index');

        if (modulesError) throw modulesError;

        setCourses(coursesData || []);
        setModules(modulesData || []);

        // Transform data into the expected CourseConfig format
        const configs: Record<string, CourseConfig> = {};
        
        console.log('Processing courses:', coursesData);
        console.log('Processing modules:', modulesData);
        
        coursesData?.forEach(course => {
          const courseModules = modulesData?.filter(m => m.course_id === course.id) || [];
          console.log(`Creating config for course ${course.id} with ${courseModules.length} modules`);
          
          configs[course.id] = {
            id: course.id,
            title: course.title,
            description: course.description,
            price: course.price / 100, // Convert from cents to dollars
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

        console.log('Final course configs:', configs);
        setCourseConfigs(configs);
      } catch (error) {
        console.error('Error fetching course data:', error);
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
  };
};