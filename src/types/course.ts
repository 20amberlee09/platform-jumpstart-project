export interface CourseModule {
  id: string;
  name: string;
  description: string;
  component: string;
  required: boolean;
  order: number;
  icon?: string;
}

export interface CourseConfig {
  id: string;
  title: string;
  description: string;
  price: number;
  modules: CourseModule[];
  features: string[];
  overview: {
    title: string;
    subtitle: string;
    description: string;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  completed: boolean;
  data?: any;
}

export interface WorkflowState {
  courseId: string;
  currentStep: number;
  completedSteps: number[];
  stepData: Record<string, any>;
  isComplete: boolean;
}