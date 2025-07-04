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
        {/* Hero Section with Logo Background */}
        <div 
          className="text-center mb-12 py-16 rounded-xl relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/lovable-uploads/bc3a82ad-d4e6-4ec7-a355-4d7bb5a51845.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-royal-glow">
              {courseConfig.overview.title}
              <span className="block text-primary mt-2">{courseConfig.overview.subtitle}</span>
            </h1>
            <p className="text-xl text-foreground max-w-3xl mx-auto mb-8">
              {courseConfig.overview.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasPurchased ? (
                <Button size="lg" className="btn-royal-gold text-lg px-8" onClick={onStartWorkflow}>
                  Start Your Course
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="btn-royal-gold text-lg px-8" 
                    onClick={handlePayment}
                    disabled={isPaymentLoading}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isPaymentLoading ? "Processing..." : `Purchase Course - $${courseConfig.price}`}
                  </Button>
                  <Button 
                    size="lg" 
                    className="btn-royal-teal text-lg px-8" 
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
              <Link to="/">
                <Button size="lg" variant="outline" className="text-lg px-8 border-primary text-primary hover:bg-primary hover:text-black">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Course Features */}
        <div className="space-y-8">
          {courseConfig.modules.map((module, index) => (
            <Card key={module.id} className="card-royal border-2 border-primary glow-gold">
              <CardHeader className="pb-4 bg-gradient-gold/10">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary p-3 rounded-lg glow-gold">
                    <div className="h-8 w-8 text-black flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2 text-primary">{module.name}</CardTitle>
                    <CardDescription className="text-base text-foreground">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Features List */}
        <div className="mt-16 bg-gradient-royal rounded-lg p-8 border-2 border-electric-blue glow-blue">
          <h3 className="text-2xl font-bold mb-6 text-center text-primary">What's Included</h3>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {courseConfig.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-card/50 border border-primary/30">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 glow-gold" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-royal rounded-lg text-primary border-2 border-primary glow-gold">
          <h2 className="text-3xl font-bold mb-4 text-royal-glow">Ready to Get Started?</h2>
          <p className="text-xl mb-6 text-foreground/90">
            Complete your {courseConfig.title.toLowerCase()} in under 30 minutes with our guided process.
          </p>
          {hasPurchased ? (
            <Button 
              size="lg" 
              className="btn-royal-gold text-lg px-8"
              onClick={onStartWorkflow}
            >
              Begin Your {courseConfig.title}
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="btn-royal-gold text-lg px-8"
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