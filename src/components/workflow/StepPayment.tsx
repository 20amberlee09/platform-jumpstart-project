import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, CheckCircle, Clock } from 'lucide-react';

interface StepPaymentProps {
  onNext: () => void;
  onPrev: () => void;
}

const StepPayment = ({ onNext, onPrev }: StepPaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onNext();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CreditCard className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Secure Payment</h2>
        <p className="text-muted-foreground">
          Complete your payment to begin the trust creation process
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Shield className="h-5 w-5 mr-2" />
              Trust Boot Camp Course
            </CardTitle>
            <CardDescription>
              Irrevocable Living Trust Creation Package
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Course Access</span>
                <Badge variant="secondary">Included</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Trust Document Creation</span>
                <Badge variant="secondary">Included</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Custom Trust Seal</span>
                <Badge variant="secondary">Included</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Digital Signatures</span>
                <Badge variant="secondary">Included</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Online Notarization</span>
                <Badge variant="secondary">Included</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Google Drive Delivery</span>
                <Badge variant="secondary">Included</Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>$497</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                One-time payment, no recurring charges
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Secure 256-bit SSL encryption</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Instant access after payment</span>
              </div>
            </div>

            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay $497 & Start Process
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By clicking "Pay", you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6 max-w-md mx-auto">
        <Button onClick={onPrev} variant="outline" size="lg">
          Back to NDA
        </Button>
      </div>
    </div>
  );
};

export default StepPayment;