import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Gift, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { CourseConfig } from "@/hooks/useCourseData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";


interface CourseOverviewProps {
  courseConfig: CourseConfig;
  onStartWorkflow: () => void;
}

const CourseOverview = ({ courseConfig, onStartWorkflow }: CourseOverviewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [giftCode, setGiftCode] = useState('');
  const [validatingGift, setValidatingGift] = useState(false);
  const [showGiftInput, setShowGiftInput] = useState(false);

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

    // Redirect to PayPal payment link
    window.open('https://www.paypal.com/ncp/payment/4QSTXR5Z9UVEW', '_blank');
  };

  const validateGiftCode = async () => {
    if (!giftCode.trim() || !user) return;
    
    setValidatingGift(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('validate-gift-code', {
        body: {
          code: giftCode.trim().toUpperCase(),
          courseId: courseConfig.id
        }
      });

      if (error) throw error;

      if (response.valid) {
        // Redeem the gift code
        const { error: redeemError } = await supabase.functions.invoke('redeem-gift-code', {
          body: {
            giftCodeId: response.giftCodeId,
            userId: user.id
          }
        });

        if (redeemError) throw redeemError;

        toast({
          title: "Gift code applied!",
          description: "You now have free access to this course.",
        });

        // Set as purchased and allow access
        setHasPurchased(true);
      } else {
        toast({
          title: "Invalid gift code",
          description: response.error || "Please check your code and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error validating gift code",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setValidatingGift(false);
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
                <Button 
                  size="lg" 
                  className="btn-royal-gold text-lg px-8" 
                  onClick={handlePayment}
                  disabled={isPaymentLoading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isPaymentLoading ? "Processing..." : `Purchase Course - $${courseConfig.price}`}
                </Button>
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
            <div className="max-w-md mx-auto space-y-6">
              {/* Gift Code Section */}
              <Card className="bg-background/50 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 justify-center text-primary">
                    <Gift className="h-5 w-5" />
                    Have a Gift Code?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showGiftInput ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowGiftInput(true)}
                      className="w-full border-primary text-primary hover:bg-primary hover:text-black"
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Enter Gift Code
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="gift-code" className="text-foreground">Gift Code</Label>
                        <Input
                          id="gift-code"
                          placeholder="Enter your gift code"
                          value={giftCode}
                          onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                          disabled={validatingGift}
                          className="bg-background border-primary/30"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={validateGiftCode}
                          disabled={!giftCode.trim() || validatingGift || !user}
                          className="flex-1 btn-royal-gold"
                        >
                          {validatingGift ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            'Apply Gift Code'
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowGiftInput(false);
                            setGiftCode('');
                          }}
                          disabled={validatingGift}
                          className="border-primary text-primary hover:bg-primary hover:text-black"
                        >
                          Cancel
                        </Button>
                      </div>
                      {!user && (
                        <p className="text-sm text-muted-foreground">
                          Please log in to use a gift code
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>

              <Button 
                size="lg" 
                className="btn-royal-gold text-lg px-8 w-full"
                onClick={handlePayment}
                disabled={isPaymentLoading}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isPaymentLoading ? "Processing..." : `Purchase & Start - $${courseConfig.price}`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;