import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, CheckCircle, Gift, Loader2 } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StepPaymentProps {
  onNext: (data: any) => void;
  data: any;
  courseConfig: any;
}

const StepPayment = ({ onNext, data, courseConfig }: StepPaymentProps) => {
  const { isDemoMode, getDummyData } = useDemoMode();
  const { user } = useAuth();
  const { toast } = useToast();
  const demoData = isDemoMode ? getDummyData('step-payment') : {};
  const [paymentComplete, setPaymentComplete] = useState(demoData?.status === 'completed' || false);
  const [giftCode, setGiftCode] = useState('');
  const [validatingGift, setValidatingGift] = useState(false);
  const [showGiftInput, setShowGiftInput] = useState(false);

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

        // Skip payment and proceed
        setPaymentComplete(true);
        setTimeout(() => {
          onNext({ 
            paymentComplete: true, 
            amount: 0,
            giftCodeUsed: giftCode.trim().toUpperCase(),
            status: 'completed'
          });
        }, 1000);
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
    setPaymentComplete(true);
    setTimeout(() => {
      onNext({ 
        paymentComplete: true, 
        amount: courseConfig.price,
        status: 'completed'
      });
    }, 1000);
  };

  if (paymentComplete) {
    return (
      <div className="text-center py-16">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Payment Complete</h2>
        <Button onClick={() => onNext(data)} size="lg">
          Continue to NDA Agreement
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Course Payment</h2>
        <p className="text-muted-foreground">Complete payment to access the course</p>
      </div>

      {/* Gift Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Have a Gift Code?
          </CardTitle>
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
          <CardTitle>{courseConfig.title} - ${courseConfig.price}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePayment} size="lg" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            {isDemoMode ? 'Complete Demo Payment' : `Pay $${courseConfig.price}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepPayment;