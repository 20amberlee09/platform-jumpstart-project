import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface StepPaymentProps {
  onNext: (data: any) => void;
  data: any;
  courseConfig: any;
}

const StepPayment = ({ onNext, data, courseConfig }: StepPaymentProps) => {
  const { isDemoMode, getDummyData } = useDemoMode();
  const demoData = isDemoMode ? getDummyData('step-payment') : {};
  const [paymentComplete, setPaymentComplete] = useState(demoData?.status === 'completed' || false);

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