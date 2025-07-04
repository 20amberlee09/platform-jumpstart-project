import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Shield, Scale, Award, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import WorkflowEngine from "@/components/workflow/WorkflowEngine";
import CourseOverview from "@/components/CourseOverview";
import { courseConfigs } from "@/config/courses";

const Automation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showOverview, setShowOverview] = useState(true);
  const courseId = 'trust-bootcamp';

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
      courseConfig={courseConfigs[courseId]}
      onStartWorkflow={startWorkflow}
    />
  );
};

export default Automation;