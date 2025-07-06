import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, ArrowRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [processingPayment, setProcessingPayment] = useState(true);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        // Get the pending order ID from localStorage or URL params
        const pendingOrderId = localStorage.getItem('pendingOrderId') || searchParams.get('orderId');
        const courseId = localStorage.getItem('pendingCourseId') || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
        
        if (pendingOrderId) {
          // Mark the order as paid
          const { error: orderError } = await supabase
            .from('orders')
            .update({ 
              status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('id', pendingOrderId)
            .eq('user_id', user.id);

          if (orderError) {
            console.error('Order update error:', orderError);
            throw new Error('Failed to confirm payment status');
          }

          // Clear the pending order info
          localStorage.removeItem('pendingOrderId');
          localStorage.removeItem('pendingCourseId');
          
          setPaymentConfirmed(true);
        } else {
          // No pending order found, check if user already has access
          const { data: existingOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .eq('status', 'paid')
            .maybeSingle();
            
          if (existingOrder) {
            setPaymentConfirmed(true);
          } else {
            setError('No payment found. If you completed a payment, please contact support.');
          }
        }

        // Show success toast
        if (!error) {
          toast({
            title: "Payment Successful! 🎉",
            description: "Welcome to Boot Camp documents! You now have full access.",
          });
        }

      } catch (error: any) {
        console.error('Error processing payment:', error);
        setError(error.message || 'Payment processed, but there was an issue confirming access.');
        toast({
          title: "Payment processed",
          description: "There was an issue confirming your access. Please contact support if needed.",
          variant: "destructive"
        });
      } finally {
        setProcessingPayment(false);
      }
    };

    processPaymentSuccess();
  }, [navigate, toast, user, searchParams, error]);

  const handleStartCourse = () => {
    try {
      navigate('/');
    } catch (error) {
      window.location.href = '/';
    }
  };

  const handleManualConfirmation = async () => {
    if (!user) return;
    
    try {
      setProcessingPayment(true);
      
      // Manual confirmation - create a paid order for this user
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          course_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          amount: 15000, // $150 in cents
          currency: 'usd',
          status: 'paid'
        });
        
      if (error) throw error;
      
      setPaymentConfirmed(true);
      setError(null);
      
      toast({
        title: "Access Confirmed! 🎉",
        description: "You now have full access to Boot Camp documents!",
      });
      
    } catch (error: any) {
      console.error('Manual confirmation error:', error);
      toast({
        title: "Confirmation Error",
        description: "Please contact support for assistance.",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (processingPayment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Processing Payment...</h3>
              <p className="text-muted-foreground">Please wait while we confirm your payment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {paymentConfirmed ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <AlertCircle className="h-16 w-16 text-amber-500" />
              )}
            </div>
            <CardTitle className={`text-3xl mb-2 ${paymentConfirmed ? 'text-green-600' : 'text-amber-600'}`}>
              {paymentConfirmed ? 'Payment Successful!' : 'Payment Confirmation'}
            </CardTitle>
            <CardDescription className="text-lg">
              {paymentConfirmed 
                ? 'Thank you for your purchase. You now have full access!'
                : error || 'Confirming your payment status...'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentConfirmed ? (
              <>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center space-x-2 text-green-700">
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">Payment Confirmed</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Full access to Boot Camp documents activated
                  </p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full btn-royal-gold"
                  onClick={handleStartCourse}
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Start Your Course Now
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-center space-x-2 text-amber-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Payment Confirmation Needed</span>
                  </div>
                  <p className="text-sm text-amber-600 mt-1">
                    If you completed your PayPal payment, click below to confirm access
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full btn-royal-gold"
                    onClick={handleManualConfirmation}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Confirming...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        I Completed My PayPal Payment
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/purchase')}
                  >
                    Back to Payment Page
                  </Button>
                </div>
              </>
            )}

            <div className="text-sm text-muted-foreground pt-4 border-t">
              <p>
                Questions about your purchase? Contact us at{' '}
                <a href="mailto:support@truthhurtz.com" className="text-primary hover:underline">
                  support@truthhurtz.com
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