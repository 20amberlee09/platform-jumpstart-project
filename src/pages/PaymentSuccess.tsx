import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [processingPayment, setProcessingPayment] = useState(true);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        // Get the pending order ID from localStorage
        const pendingOrderId = localStorage.getItem('pendingOrderId');
        
        if (pendingOrderId) {
          // Mark the order as paid
          const { error } = await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', pendingOrderId)
            .eq('user_id', user.id);

          if (error) throw error;

          // Clear the pending order ID
          localStorage.removeItem('pendingOrderId');
        }

        // Show success toast
        toast({
          title: "Payment successful!",
          description: "Starting your course now...",
        });

        setProcessingPayment(false);

        // Immediately redirect to course workflow
        setTimeout(() => {
          navigate('/automation?start=true');
        }, 1500);
      } catch (error) {
        console.error('Error processing payment:', error);
        toast({
          title: "Payment processed, but there was an issue",
          description: "Please contact support if you continue to have problems accessing your course.",
          variant: "destructive"
        });
        setProcessingPayment(false);
      }
    };

    processPaymentSuccess();
  }, [navigate, toast, user]);

  const handleStartCourse = () => {
    navigate('/automation');
  };

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl text-green-600 mb-2">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for your purchase. Starting your course now...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Payment Confirmed</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Automatically redirecting to your course...
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Redirecting to your course automatically...
                </p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground pt-4 border-t">
              <p>
                Questions about your purchase? Contact us at{' '}
                <a href="mailto:support@example.com" className="text-primary hover:underline">
                  support@example.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;