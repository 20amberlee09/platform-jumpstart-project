import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Shield, Scale, Award, Users } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import WorkflowEngine from "@/components/workflow/WorkflowEngine";
import CourseOverview from "@/components/CourseOverview";
import { useCourseData } from "@/hooks/useCourseData";
import { supabase } from "@/integrations/supabase/client";

const Automation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courseConfigs, loading } = useCourseData();
  const [showOverview, setShowOverview] = useState(true);
  const [hasCourseAccess, setHasCourseAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const courseId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Using the UUID from our migration

  // Check if user should auto-start the course
  const shouldAutoStart = searchParams.get('start') === 'true';

  // Check if user has access to this course (via purchase or gift code)
  const checkCourseAccess = async () => {
    if (!user) {
      setCheckingAccess(false);
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
        setCheckingAccess(false);
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
      setCheckingAccess(false);
    }
  };

  useEffect(() => {
    checkCourseAccess();
  }, [user]);

  // Auto-start course if user has access and is being redirected from login
  useEffect(() => {
    console.log('Auto-start check:', { shouldAutoStart, hasCourseAccess, checkingAccess, loading });
    if (shouldAutoStart && hasCourseAccess && !checkingAccess && !loading) {
      console.log('Auto-starting course workflow');
      setShowOverview(false);
    }
  }, [shouldAutoStart, hasCourseAccess, checkingAccess, loading]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{loading ? 'Loading course...' : 'Checking access...'}</p>
        </div>
      </div>
    );
  }

  const courseConfig = courseConfigs[courseId];
  if (!courseConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Course Not Found</CardTitle>
            <CardDescription>
              The requested course is not available at this time.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const startWorkflow = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!hasCourseAccess) {
      // Stay on overview to show purchase options
      return;
    }
    setShowOverview(false);
  };

  const handleWorkflowComplete = () => {
    setShowOverview(true);
  };

  if (!showOverview && hasCourseAccess) {
    return (
      <WorkflowEngine 
        courseId={courseId}
        onComplete={handleWorkflowComplete}
      />
    );
  }

  return (
    <CourseOverview 
      courseConfig={courseConfig}
      onStartWorkflow={startWorkflow}
    />
  );
};

export default Automation;