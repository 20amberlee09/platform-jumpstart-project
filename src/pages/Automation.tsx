import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Shield, Scale, Award, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import WorkflowEngine from "@/components/workflow/WorkflowEngine";
import CourseOverview from "@/components/CourseOverview";
import { useCourseData } from "@/hooks/useCourseData";

const Automation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courseConfigs, loading } = useCourseData();
  const [showOverview, setShowOverview] = useState(true);
  const courseId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Using the UUID from our migration

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
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
    setShowOverview(false);
  };

  const handleWorkflowComplete = () => {
    setShowOverview(true);
  };

  if (!showOverview) {
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