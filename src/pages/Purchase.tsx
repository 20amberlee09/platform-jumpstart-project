import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, ArrowLeft, Shield, Clock, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCourseData } from "@/hooks/useCourseData";
import { supabase } from "@/integrations/supabase/client";

const Purchase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { courseConfigs, loading } = useCourseData();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  
  const courseId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const courseConfig = courseConfigs[courseId];

  // Check if user has already purchased this course
  const checkPurchaseStatus = async () => {
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
        setHasPurchased(true);
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
        
      setHasPurchased(!!giftData);
    } catch (error) {
      setHasPurchased(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase this course.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      setIsPaymentLoading(true);
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          course_id: courseId,
          amount: courseConfig?.price * 100 || 15000,
          currency: 'usd',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      localStorage.setItem('pendingOrderId', order.id);
      window.open('https://www.paypal.com/ncp/payment/4QSTXR5Z9UVEW', '_blank');
      
      toast({
        title: "Redirecting to PayPal",
        description: "Complete your payment to access the course.",
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  useEffect(() => {
    checkPurchaseStatus();
  }, [user]);

  useEffect(() => {
    // If user already has access, redirect to home page
    if (hasPurchased && !checkingAccess) {
      toast({
        title: "Course Access Confirmed",
        description: "You already have access to this course!",
      });
      navigate('/');
    }
  }, [hasPurchased, checkingAccess, navigate, toast]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Purchase Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary text-royal-glow">
            Complete Your Purchase
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure your spot in the Boot Camp documents course and start creating your trust immediately.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Course Summary */}
          <div className="space-y-6">
            <Card className="card-royal border-2 border-primary">
              <CardHeader className="bg-gradient-gold/10">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-primary text-black border-primary">
                    Complete Package
                  </Badge>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">${courseConfig.price}</div>
                    <div className="text-sm text-electric-blue">One-time payment</div>
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2 text-primary">Boot Camp documents</CardTitle>
                <CardDescription className="text-base text-foreground">
                  Complete ecclesiastic revocable living trust creation with ministerial ordination, 
                  verification services, and professional documentation.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center text-electric-blue">
                    <Clock className="h-5 w-5 mr-2 text-electric-blue glow-blue" />
                    <span>Complete in 8 guided steps</span>
                  </div>
                  <div className="flex items-center text-electric-blue">
                    <Shield className="h-5 w-5 mr-2 text-electric-blue glow-blue" />
                    <span>Secure payment via PayPal</span>
                  </div>
                  <div className="flex items-center text-electric-blue">
                    <Award className="h-5 w-5 mr-2 text-electric-blue glow-blue" />
                    <span>Professional documentation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card className="border-2 border-electric-blue glow-blue">
              <CardHeader>
                <CardTitle className="text-xl text-primary">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {courseConfig.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 glow-gold" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      + {courseConfig.features.length - 6} more features included
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <Card className="card-royal border-2 border-primary glow-gold bg-gradient-royal">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-primary">
                  Ready to Get Started?
                </CardTitle>
                <CardDescription className="text-center text-foreground">
                  Click below to complete your secure payment via PayPal
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-background/50 rounded-lg border border-primary/30">
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${courseConfig.price}
                  </div>
                  <div className="text-muted-foreground">
                    One-time payment • No recurring fees
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full btn-royal-gold text-xl py-6"
                  onClick={handlePayment}
                  disabled={isPaymentLoading}
                >
                  <CreditCard className="mr-3 h-6 w-6" />
                  {isPaymentLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay $${courseConfig.price} with PayPal`
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Secure payment powered by PayPal
                  </p>
                  <div className="flex justify-center items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      256-bit SSL
                    </div>
                    <div>•</div>
                    <div>PCI Compliant</div>
                    <div>•</div>
                    <div>Money Back Protection</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="border border-primary/30">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-center text-primary">Why Choose Us?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                    <span>Professional ecclesiastic trust formation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                    <span>Automated legal documentation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                    <span>Complete in under 30 minutes</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                    <span>Professional verification elements</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="mt-16 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-muted-foreground mb-4">
              Have a gift code? Use it from the navigation menu above, or 
              <Link to="/" className="text-primary hover:underline ml-1">
                return to the home page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchase;