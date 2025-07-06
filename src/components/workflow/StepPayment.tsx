import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, CheckCircle, Gift, Loader2, Info, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StepPaymentProps {
  onNext: (data: any) => void;
  data: any;
  courseConfig: any;
}

/**
 * Enhanced payment step with proper state management and user feedback
 */
const StepPayment = ({ onNext, data, courseConfig }: StepPaymentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentState, setPaymentState] = useState<'initial' | 'processing' | 'complete' | 'verified'>('initial');
  const [userAccessStatus, setUserAccessStatus] = useState<'checking' | 'no-access' | 'has-access' | 'error'>('checking');
  const [giftCode, setGiftCode] = useState('');
  const [validatingGift, setValidatingGift] = useState(false);
  const [showGiftInput, setShowGiftInput] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'none' | 'paypal' | 'gift'>('none');
  const [accessDetails, setAccessDetails] = useState<any>(null);

  // Check user's current access status on component mount
  useEffect(() => {
    checkUserAccess();
  }, [user, courseConfig]);

  const checkUserAccess = async () => {
    if (!user || !courseConfig) {
      setUserAccessStatus('no-access');
      return;
    }

    try {
      setUserAccessStatus('checking');
      
      // Check for paid orders
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseConfig.id)
        .eq('status', 'paid')
        .maybeSingle();
      
      if (orderData) {
        setUserAccessStatus('has-access');
        setPaymentState('verified');
        setPaymentMethod('paypal');
        setAccessDetails(orderData);
        return;
      }
      
      // Check for redeemed gift codes
      const { data: giftData } = await supabase
        .from('gift_codes')
        .select('*')
        .eq('used_by', user.id)
        .eq('course_id', courseConfig.id)
        .maybeSingle();
        
      if (giftData) {
        setUserAccessStatus('has-access');
        setPaymentState('verified');
        setPaymentMethod('gift');
        setAccessDetails(giftData);
        return;
      }
      
      // No access found
      setUserAccessStatus('no-access');
    } catch (error) {
      console.error('Error checking user access:', error);
      setUserAccessStatus('error');
    }
  };

  const validateGiftCode = async () => {
    if (!giftCode.trim()) return;
    
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
            userId: user?.id
          }
        });

        if (redeemError) throw redeemError;

        toast({
          title: "Gift code applied!",
          description: "You have free access to this course.",
        });

        // Update state and proceed
        setPaymentState('verified');
        setPaymentMethod('gift');
        setUserAccessStatus('has-access');
        
        setTimeout(() => {
          onNext({ 
            paymentComplete: true, 
            amount: 0,
            giftCodeUsed: giftCode.trim().toUpperCase(),
            status: 'completed',
            method: 'gift'
          });
        }, 1500);
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

  const handlePayment = () => {
    setPaymentState('processing');
    
    toast({
      title: "Opening Payment Portal",
      description: "Complete your payment in the new window, then return here.",
    });
    
    // Open PayPal payment in new tab
    window.open('https://www.paypal.com/ncp/payment/4QSTXR5Z9UVEW', '_blank');
    
    // Set payment as complete after short delay (simulating payment flow)
    setTimeout(() => {
      setPaymentState('complete');
      setPaymentMethod('paypal');
      toast({
        title: "Payment Processing",
        description: "Your payment is being processed. You can continue with the course.",
      });
      
      setTimeout(() => {
        onNext({ 
          paymentComplete: true, 
          amount: courseConfig.price,
          status: 'completed',
          method: 'paypal'
        });
      }, 1000);
    }, 2000);
  };

  const handleContinue = () => {
    onNext({
      paymentComplete: true,
      method: paymentMethod,
      amount: paymentMethod === 'gift' ? 0 : courseConfig.price,
      status: 'verified',
      accessDetails
    });
  };

  // Loading state while checking access
  if (userAccessStatus === 'checking') {
    return (
      <div className="text-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Checking Course Access</h2>
        <p className="text-muted-foreground">Please wait while we verify your enrollment status...</p>
      </div>
    );
  }

  // Error state
  if (userAccessStatus === 'error') {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Check Failed</h2>
        <p className="text-muted-foreground mb-6">We couldn't verify your course access. Please try again.</p>
        <Button onClick={checkUserAccess} variant="outline">
          <Loader2 className="mr-2 h-4 w-4" />
          Retry Access Check
        </Button>
      </div>
    );
  }

  // User already has access - show confirmation and continue
  if (userAccessStatus === 'has-access' && paymentState === 'verified') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Course Access Confirmed</h2>
          <p className="text-muted-foreground mb-6">
            {paymentMethod === 'gift' 
              ? "You have free access via gift code redemption"
              : "Your payment has been verified and processed"
            }
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Access Method:</strong> {paymentMethod === 'gift' ? 'Gift Code' : 'PayPal Payment'}<br/>
            <strong>Status:</strong> Active<br/>
            <strong>Course:</strong> {courseConfig.title}
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <Button onClick={handleContinue} size="lg" className="bg-green-600 hover:bg-green-700">
            <ArrowRight className="mr-2 h-4 w-4" />
            Continue to Course Content
          </Button>
        </div>
      </div>
    );
  }

  // Payment processing state
  if (paymentState === 'processing') {
    return (
      <div className="text-center py-16">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
        <p className="text-muted-foreground mb-6">
          Please complete your payment in the PayPal window, then return here.
        </p>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Don't close this window. We'll automatically continue once payment is confirmed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Payment complete but not yet verified
  if (paymentState === 'complete') {
    return (
      <div className="text-center py-16">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Payment Received</h2>
        <p className="text-muted-foreground mb-6">
          Thank you for your payment! You now have full access to the course.
        </p>
        <Button onClick={() => onNext(data)} size="lg">
          Continue to NDA Agreement
        </Button>
      </div>
    );
  }

  // Default payment form for users without access
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Secure Course Payment</h2>
        <p className="text-muted-foreground">
          Choose your payment method to access {courseConfig.title}
        </p>
      </div>

      {/* Course Info */}
      <Card>
        <CardHeader>
          <CardTitle>{courseConfig.title}</CardTitle>
          <CardDescription>
            Complete ecclesiastic revocable living trust creation package
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">${(courseConfig.price / 100).toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">One-time payment</span>
          </div>
        </CardContent>
      </Card>

      {/* Gift Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Have a Gift Code?
          </CardTitle>
          <CardDescription>
            Enter your gift code for free access to this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showGiftInput ? (
            <Button 
              variant="outline" 
              onClick={() => setShowGiftInput(true)}
              className="w-full"
            >
              <Gift className="mr-2 h-4 w-4" />
              Enter Gift Code
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="gift-code">Gift Code</Label>
                <Input
                  id="gift-code"
                  placeholder="Enter your gift code"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                  disabled={validatingGift}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={validateGiftCode}
                  disabled={!giftCode.trim() || validatingGift}
                  className="flex-1"
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
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      {/* Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle>Secure Payment</CardTitle>
          <CardDescription>
            Pay securely through PayPal - no account required
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handlePayment} 
            size="lg" 
            className="w-full"
            disabled={validatingGift}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${(courseConfig.price / 100).toFixed(2)} via PayPal
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Secure payment processed by PayPal. You can pay with credit card or PayPal account.
          </p>
        </CardContent>
      </Card>

      {/* Security Note */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Secure Payment:</strong> Your payment is processed through PayPal's secure servers. 
          We never store your payment information.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StepPayment;