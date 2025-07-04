import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard, TestTube } from "lucide-react";
import { Link } from "react-router-dom";
import { CourseConfig } from "@/types/course";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDemoMode } from "@/contexts/DemoModeContext";

interface CourseOverviewProps {
  courseConfig: CourseConfig;
  onStartWorkflow: () => void;
}

const CourseOverview = ({ courseConfig, onStartWorkflow }: CourseOverviewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isDemoMode, setDemoMode } = useDemoMode();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Check if user has already purchased this course
  const checkPurchaseStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseConfig.id)
        .eq('status', 'paid')
        .single();
        
      setHasPurchased(!!data);
    } catch (error) {
      // No purchase found, which is fine
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase this course.",
        variant: "destructive"
      });
      return;
    }

    setIsPaymentLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { courseId: courseConfig.id }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // Check purchase status when component mounts
  useEffect(() => {
    checkPurchaseStatus();
  }, [user]);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {courseConfig.overview.title}
            <span className="block text-primary mt-2">{courseConfig.overview.subtitle}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {courseConfig.overview.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {hasPurchased ? (
              <Button size="lg" className="text-lg px-8" onClick={onStartWorkflow}>
                Start Your Course
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="text-lg px-8" 
                  onClick={handlePayment}
                  disabled={isPaymentLoading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isPaymentLoading ? "Processing..." : `Purchase Course - $${courseConfig.price}`}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 border-primary text-primary hover:bg-primary hover:text-white" 
                  onClick={() => {
                    setDemoMode(true);
                    onStartWorkflow();
                  }}
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  Try Demo Mode
                </Button>
              </>
            )}
            <Link to="/courses">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View All Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Course Features */}
        <div className="space-y-8">
          {courseConfig.modules.map((module, index) => (
            <Card key={module.id} className="shadow-legal-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="h-8 w-8 text-primary flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{module.name}</CardTitle>
                    <CardDescription className="text-base">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Features List */}
        <div className="mt-16 bg-muted/50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">What's Included</h3>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {courseConfig.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-primary rounded-lg text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 text-white/90">
            Complete your {courseConfig.title.toLowerCase()} in under 30 minutes with our guided process.
          </p>
          {hasPurchased ? (
            <Button 
              size="lg" 
              className="bg-white text-legal-primary hover:bg-white/90 text-lg px-8"
              onClick={onStartWorkflow}
            >
              Begin Your {courseConfig.title}
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="bg-white text-legal-primary hover:bg-white/90 text-lg px-8"
              onClick={handlePayment}
              disabled={isPaymentLoading}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isPaymentLoading ? "Processing..." : `Purchase & Start - $${courseConfig.price}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;