import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Shield, Scale, Award, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import StepIndicator from "@/components/workflow/StepIndicator";
import StepNDA from "@/components/workflow/StepNDA";
import StepPayment from "@/components/workflow/StepPayment";
import Step1Identity from "@/components/workflow/Step1Identity";
import Step2Trust from "@/components/workflow/Step2Trust";
import Step3DocumentAssembly from "@/components/workflow/Step3DocumentAssembly";

const Automation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [workflowData, setWorkflowData] = useState({});
  const [showOverview, setShowOverview] = useState(true);

  const steps = [
    "NDA Agreement",
    "Secure Payment",
    "Identity Verification",
    "Trust Configuration", 
    "Document Assembly",
    "Digital Signatures",
    "Final Review"
  ];

  const handleStepComplete = (stepData?: any) => {
    if (stepData) {
      setWorkflowData(prev => ({ ...prev, ...stepData }));
    }
    setCompletedSteps(prev => [...prev, currentStep]);
    setCurrentStep(prev => prev + 1);
  };

  const handleStepBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const startWorkflow = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowOverview(false);
    setCurrentStep(0);
  };

  const processSteps = [
    {
      icon: Shield,
      title: "Step 1: Identity Verification",
      description: "Secure ID verification with OCR integration and automated NDA generation",
      features: [
        "Government ID scanning and verification",
        "OCR data extraction",
        "Automated NDA creation",
        "Secure document storage"
      ]
    },
    {
      icon: Scale,
      title: "Step 2: Trust Configuration", 
      description: "State-specific trust creation with intelligent clause selection",
      features: [
        "Trust type selection and configuration",
        "Beneficiary designation",
        "Asset allocation planning",
        "State law compliance verification"
      ]
    },
    {
      icon: FileText,
      title: "Step 3: Document Assembly",
      description: "Automated legal document generation with custom formatting",
      features: [
        "Template-based document creation",
        "Custom clause insertion",
        "Multi-format output (PDF, Word)",
        "Professional formatting"
      ]
    },
    {
      icon: Award,
      title: "Step 4: Digital Signatures & Seals",
      description: "Custom trust seals with QR codes and digital authentication",
      features: [
        "Custom trust seal generation",
        "QR code and barcode creation",
        "Digital signature collection",
        "Document authentication"
      ]
    },
    {
      icon: Users,
      title: "Step 5: Notarization & Delivery",
      description: "Online notarization with automated Google Drive delivery",
      features: [
        "Remote online notarization",
        "Digital witness coordination",
        "Automated Google Drive upload",
        "Completion certificates"
      ]
    }
  ];

  if (!showOverview) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep} 
            completedSteps={completedSteps} 
          />
          
          {currentStep === 0 && (
            <StepNDA 
              onNext={handleStepComplete}
            />
          )}
          
          {currentStep === 1 && (
            <StepPayment 
              onNext={handleStepComplete}
              onPrev={handleStepBack}
            />
          )}
          
          {currentStep === 2 && (
            <Step1Identity 
              onNext={handleStepComplete}
              data={workflowData}
            />
          )}
          
          {currentStep === 3 && (
            <Step2Trust 
              onNext={handleStepComplete}
              onPrev={handleStepBack}
              data={workflowData}
            />
          )}
          
          {currentStep === 4 && (
            <Step3DocumentAssembly 
              onNext={handleStepComplete}
              onPrev={handleStepBack}
              data={workflowData}
            />
          )}
          
          {currentStep >= 5 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">More Steps Coming Soon!</h2>
              <p className="text-muted-foreground mb-6">
                Steps 6-7 (Digital Signatures and Final Review) are currently in development.
              </p>
              <Button onClick={() => setShowOverview(true)} variant="outline">
                Back to Overview
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Legal Document Automation
            <span className="block text-primary mt-2">5-Step Process</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Our AI-powered platform guides you through each step of creating professional legal documents 
            with automated verification, custom seals, and online notarization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" onClick={startWorkflow}>
              Start Free Process
            </Button>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Course Options
              </Button>
            </Link>
          </div>
        </div>

        {/* Process Steps */}
        <div className="space-y-8">
          {processSteps.map((step, index) => (
            <Card key={index} className="shadow-legal-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{step.title}</CardTitle>
                    <CardDescription className="text-base">
                      {step.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-primary rounded-lg text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 text-white/90">
            Complete your legal documents in under 30 minutes with our guided process.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-legal-primary hover:bg-white/90 text-lg px-8"
            onClick={startWorkflow}
          >
            Begin Your Legal Documents
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Automation;