import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Scale, Clock, Award, CreditCard, Gift, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCourseData } from "@/hooks/useCourseData";
import { supabase } from "@/integrations/supabase/client";
import WorkflowEngine from "@/components/workflow/WorkflowEngine";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { courseConfigs, loading } = useCourseData();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [giftCode, setGiftCode] = useState('');
  const [validatingGift, setValidatingGift] = useState(false);
  const [showGiftInput, setShowGiftInput] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  
  const courseId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const courseConfig = courseConfigs[courseId];

  const bootCampFeatures = [
    "Complete $150 package - no recurring fees",
    "GUIDED: Government ID upload - you provide, we verify automatically",
    "AUTOMATED: Trust name availability verification (USPTO & State searches)",
    "GUIDED: Ministerial ordination certificate upload - you provide the certificate",
    "AUTOMATED: Ecclesiastic revocable living trust document creation",
    "AUTOMATED: Gmail account setup with proper trust naming convention",
    "AUTOMATED: Google Drive folder creation and organization",
    "AUTOMATED: QR code generation for all documentation",
    "GUIDED: Barcode certificate purchase guidance and upload",
    "GUIDED: Custom document seal creation and upload",
    "AUTOMATED: Professional document generation with all verification elements",
    "GUIDED: Document review - you approve before finalization",
    "AUTOMATED: Final document delivery to your Google Drive"
  ];

  const checkPurchaseStatus = useCallback(async () => {
    if (!user) {
      setCheckingAccess(false);
      return;
    }
    
    try {
      // Check for paid orders with error handling
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'paid')
        .maybeSingle();
      
      if (orderError) {
        console.error('Error checking orders:', orderError);
        // Continue to check gift codes even if orders check fails
      } else if (orderData) {
        setHasPurchased(true);
        setCheckingAccess(false);
        return;
      }
      
      // Check for redeemed gift codes with error handling
      const { data: giftData, error: giftError } = await supabase
        .from('gift_codes')
        .select('*')
        .eq('used_by', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (giftError) {
        console.error('Error checking gift codes:', giftError);
        setHasPurchased(false);
      } else {
        setHasPurchased(!!giftData);
      }
    } catch (error) {
      console.error('Purchase status check failed:', error);
      setHasPurchased(false);
    } finally {
      setCheckingAccess(false);
    }
  }, [user, courseId]);

  const handlePayment = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    try {
      navigate('/purchase');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: redirect using window.location if navigate fails
      window.location.href = '/purchase';
    }
  };

  const validateGiftCode = async () => {
    if (!giftCode.trim() || !user) return;
    
    setValidatingGift(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('validate-gift-code', {
        body: {
          code: giftCode.trim().toUpperCase(),
          courseId: courseId
        }
      });

      if (error) throw error;

      if (response.valid) {
        const { error: redeemError } = await supabase.functions.invoke('redeem-gift-code', {
          body: {
            giftCodeId: response.giftCodeId,
            userId: user.id
          }
        });

        if (redeemError) throw redeemError;

        toast({
          title: "Gift code applied!",
          description: "Starting your course now...",
        });

        setHasPurchased(true);
        setTimeout(() => {
          setShowWorkflow(true);
        }, 500);
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

  const startWorkflow = () => {
    if (!user) {
      try {
        navigate('/auth');
      } catch (error) {
        window.location.href = '/auth';
      }
      return;
    }
    if (!hasPurchased) {
      toast({
        title: "Course Access Required",
        description: "Please purchase the course or use a gift code to access the content.",
        variant: "destructive"
      });
      return;
    }
    setShowWorkflow(true);
  };

  const handleWorkflowComplete = () => {
    setShowWorkflow(false);
  };

  useEffect(() => {
    checkPurchaseStatus();
  }, [checkPurchaseStatus]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading TruthHurtz...</p>
          <p className="text-xs text-muted-foreground mt-2">Preparing your personalized experience</p>
        </div>
      </div>
    );
  }

  if (showWorkflow && hasPurchased && courseConfig) {
    return (
      <WorkflowEngine 
        courseId={courseId}
        onComplete={handleWorkflowComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Logo Background */}
      <section 
        className="bg-gradient-hero text-foreground py-20 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/lovable-uploads/bc3a82ad-d4e6-4ec7-a355-4d7bb5a51845.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-royal-glow">
            TROOTHHURTZ
            <span className="block text-primary mt-2">Trust Document Automation</span>
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto mb-8">
            Professional ecclesiastic revocable living trust creation with automated legal documentation, 
            custom seal creation, and complete verification services. <strong>Mix of guided steps (where you take action) 
            and automated processes (done for you).</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {hasPurchased ? (
              <Button size="lg" className="btn-royal-gold text-lg px-8" onClick={startWorkflow}>
                Start Your Course
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="btn-royal-gold text-lg px-8" 
                onClick={handlePayment}
                disabled={false}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Purchase Course - ${courseConfig?.price || 150}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Boot Camp Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Boot Camp documents</h2>
            <p className="text-xl text-muted-foreground">
              Complete trust formation with automated legal documentation and custom seal creation
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="card-royal shadow-royal border-2 border-primary">
              <CardHeader className="pb-6 bg-gradient-gold/10">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-primary text-black border-primary">
                    Complete Package
                  </Badge>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">$150</div>
                    <div className="text-sm text-electric-blue">One-time payment</div>
                  </div>
                </div>
                <CardTitle className="text-3xl mb-4 text-primary text-royal-glow">Boot Camp documents</CardTitle>
                <div className="flex items-center text-electric-blue mb-4">
                  <Clock className="h-5 w-5 mr-2 text-electric-blue glow-blue" />
                  <span>Complete in 8 steps</span>
                </div>
                <p className="text-foreground text-lg">
                  Complete ecclesiastic revocable living trust creation with ministerial ordination, 
                  verification services, and professional documentation. All required documents must be uploaded before completion.
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {bootCampFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start p-2 rounded-lg bg-gradient-royal/20 border border-electric-blue/30">
                      <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0 glow-gold" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {hasPurchased ? (
                  <Button className="w-full btn-royal-gold" size="lg" onClick={startWorkflow}>
                    Start Your Course
                  </Button>
                ) : (
                  <Button 
                    className="w-full btn-royal-gold" 
                    size="lg"
                    onClick={handlePayment}
                    disabled={false}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Purchase Course - ${courseConfig?.price || 150}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-gradient-royal/30 border-y-2 border-primary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary text-royal-glow">8-Step Process</h2>
            <p className="text-xl text-foreground max-w-2xl mx-auto">
              Our comprehensive process ensures professional, legally compliant documentation every time
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center card-royal border-2 border-primary glow-gold">
              <CardHeader className="bg-gradient-gold/10">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4 glow-gold" />
                <CardTitle className="text-xl text-primary">Payment & NDA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground"><strong>AUTOMATED:</strong> Payment processing</p>
                <p className="text-foreground"><strong>GUIDED:</strong> NDA review and signing</p>
              </CardContent>
            </Card>

            <Card className="text-center card-royal border-2 border-electric-blue glow-blue">
              <CardHeader className="bg-gradient-royal/10">
                <Scale className="h-12 w-12 text-electric-blue mx-auto mb-4 glow-blue" />
                <CardTitle className="text-xl text-electric-blue">Identity & Trust Name</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground"><strong>GUIDED:</strong> ID upload</p>
                <p className="text-foreground"><strong>AUTOMATED:</strong> Name verification</p>
              </CardContent>
            </Card>

            <Card className="text-center card-royal border-2 border-accent-teal glow-teal">
              <CardHeader className="bg-gradient-royal/10">
                <Award className="h-12 w-12 text-electric-cyan mx-auto mb-4 glow-teal" />
                <CardTitle className="text-xl text-electric-cyan">Ordination & Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground"><strong>GUIDED:</strong> Certificate upload</p>
                <p className="text-foreground"><strong>AUTOMATED:</strong> Gmail/Drive setup</p>
              </CardContent>
            </Card>

            <Card className="text-center card-royal border-2 border-primary glow-gold">
              <CardHeader className="bg-gradient-gold/10">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4 glow-gold" />
                <CardTitle className="text-xl text-primary">Documents & Seals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground"><strong>GUIDED:</strong> Seal upload & review</p>
                <p className="text-foreground"><strong>AUTOMATED:</strong> Document generation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Prominent Course Access Button for Users with Access */}
      {hasPurchased && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Card className="card-royal border-2 border-primary glow-gold bg-gradient-royal max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-4 text-primary">You Have Access!</h2>
                <p className="text-xl mb-6 text-foreground/90">
                  Ready to start your boot camp documents? Click below to begin.
                </p>
                <Button 
                  size="lg" 
                  className="btn-royal-gold text-xl px-12 py-4 mobile-touch-optimized"
                  onClick={startWorkflow}
                >
                  🚀 Start Your Course Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Course Modules */}
      {courseConfig && (
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary text-royal-glow">Course Modules</h2>
              <p className="text-xl text-foreground max-w-2xl mx-auto">
                Step-by-step guided process to create your complete trust package
              </p>
            </div>
            
            <div className="space-y-8 max-w-6xl mx-auto">
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
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section id="course-section" className="py-20 bg-gradient-royal text-primary border-2 border-primary/50 glow-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-royal-glow">
            Ready to Create Your Trust?
          </h2>
          <p className="text-xl mb-8 text-foreground/90 max-w-2xl mx-auto">
            Complete your boot camp documents in under 30 minutes with our guided process.
          </p>
          
          {hasPurchased ? (
            <Button 
              size="lg" 
              className="btn-royal-gold text-lg px-8"
              onClick={startWorkflow}
            >
              Begin Your Boot Camp Documents
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && giftCode.trim() && user && !validatingGift) {
                              validateGiftCode();
                            }
                          }}
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
                          Please sign in to use a gift code
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
                disabled={false}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Purchase & Start - ${courseConfig?.price || 150}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-royal-black text-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">TROOTHHURTZ</span>
              </div>
              <p className="text-muted-foreground">
                Professional ecclesiastic trust formation with automated legal documentation and verification services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-primary">Services</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Ecclesiastic Trust Formation</li>
                <li>Ministerial Ordination</li>
                <li>Document Verification</li>
                <li>Custom Seal Creation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-primary">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Automated Documentation</li>
                <li>ID Verification</li>
                <li>Trust Name Search</li>
                <li>QR Code Generation</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary/20 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 TROOTHHURTZ. Professional ecclesiastic trust formation platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;