import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText } from 'lucide-react';

interface StepNDAProps {
  onNext: (data: any) => void;
  data: any;
}

const StepNDA = ({ onNext, data }: StepNDAProps) => {
  const [agreed, setAgreed] = useState(data?.agreed || false);

  const handleNext = () => {
    onNext({ 
      agreed: true, 
      signature: 'Digital Signature',
      signedAt: new Date().toISOString() 
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Non-Disclosure Agreement</h2>
        <p className="text-muted-foreground">
          Please review and accept our confidentiality agreement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Confidentiality Agreement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="nda-agreement" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label htmlFor="nda-agreement" className="text-sm font-medium">
              I agree to the Non-Disclosure Agreement terms
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} disabled={!agreed} size="lg">
          Continue to Identity Verification
        </Button>
      </div>
    </div>
  );
};

export default StepNDA;