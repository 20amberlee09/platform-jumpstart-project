import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle } from 'lucide-react';

const TestingReturnUser = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testStep, setTestStep] = useState(1);
  
  // Test credentials for returning user
  const testCredentials = {
    email: 'returninguser@test.com',
    password: 'testpassword123'
  };

  useEffect(() => {
    if (user && testStep === 2) {
      setTestStep(3);
      toast({
        title: "✅ Step 2 Complete: User Logged In",
        description: `Welcome back! User ID: ${user.id.substring(0, 8)}...`,
      });
      
      // Auto-redirect to course after login
      setTimeout(() => {
        navigate('/automation?start=true');
        setTestStep(4);
      }, 2000);
    }
  }, [user, testStep, navigate, toast]);

  const handleTestLogin = async () => {
    setIsLoading(true);
    setTestStep(2);
    
    toast({
      title: "🧪 Step 1: Simulating Returning User Login",
      description: "Testing auth system with existing user credentials...",
    });

    const { error } = await signIn(testCredentials.email, testCredentials.password);
    
    if (!error) {
      toast({
        title: "✅ Login Successful!",
        description: "System should now load saved progress...",
      });
    } else {
      toast({
        title: "❌ Login Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <User className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">🧪 Testing: Returning User Journey</CardTitle>
            <CardDescription>
              Simulating a user who previously started the course and is logging back in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${testStep >= 1 ? 'bg-green-50 border-green-200' : 'bg-muted'}`}>
                <div className="flex items-center">
                  {testStep >= 1 && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                  <span className="font-medium">Step 1: Simulate Login for Returning User</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Testing with: {testCredentials.email}
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${testStep >= 2 ? 'bg-green-50 border-green-200' : 'bg-muted'}`}>
                <div className="flex items-center">
                  {testStep >= 2 && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                  <span className="font-medium">Step 2: Verify Authentication</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  System should authenticate user and load session
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${testStep >= 3 ? 'bg-green-50 border-green-200' : 'bg-muted'}`}>
                <div className="flex items-center">
                  {testStep >= 3 && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                  <span className="font-medium">Step 3: Load Saved Progress</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  System should query database for user's previous progress
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${testStep >= 4 ? 'bg-green-50 border-green-200' : 'bg-muted'}`}>
                <div className="flex items-center">
                  {testStep >= 4 && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                  <span className="font-medium">Step 4: Resume Workflow</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirect to course workflow at saved step position
                </p>
              </div>
            </div>

            <Button 
              onClick={handleTestLogin}
              disabled={isLoading || testStep > 1}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Logging In...' : testStep > 1 ? 'Test In Progress' : '🧪 Start Returning User Test'}
            </Button>

            {testStep >= 3 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">✅ Authentication Complete!</p>
                <p className="text-blue-700 text-sm mt-1">
                  You will be automatically redirected to continue your course...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestingReturnUser;