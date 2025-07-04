import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield } from 'lucide-react';

interface StepNDAProps {
  onNext: () => void;
}

const StepNDA = ({ onNext }: StepNDAProps) => {
  const [accepted, setAccepted] = useState(false);

  const handleNext = () => {
    if (accepted) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Non-Disclosure Agreement</h2>
        <p className="text-muted-foreground">
          Please review and accept our confidentiality agreement before proceeding
        </p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Confidentiality & Non-Disclosure Agreement
          </CardTitle>
          <CardDescription>
            This agreement protects your sensitive information during the trust creation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full rounded-md border p-4">
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">1. CONFIDENTIAL INFORMATION</h3>
                <p className="text-muted-foreground">
                  For purposes of this Agreement, "Confidential Information" means all personal, financial, 
                  legal, and business information disclosed by you (the "Disclosing Party") to our legal 
                  document automation platform (the "Receiving Party"), including but not limited to:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-muted-foreground">
                  <li>Personal identity information and documentation</li>
                  <li>Financial records, asset details, and investment information</li>
                  <li>Business structures, ownership interests, and valuations</li>
                  <li>Trust objectives, beneficiary information, and distribution preferences</li>
                  <li>Any other sensitive information provided during the trust creation process</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. CONFIDENTIALITY OBLIGATIONS</h3>
                <p className="text-muted-foreground">
                  The Receiving Party agrees to:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-muted-foreground">
                  <li>Maintain strict confidentiality of all Confidential Information</li>
                  <li>Use Confidential Information solely for the purpose of providing legal document services</li>
                  <li>Not disclose Confidential Information to any third party without written consent</li>
                  <li>Implement reasonable security measures to protect Confidential Information</li>
                  <li>Return or destroy all Confidential Information upon request</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. SECURITY MEASURES</h3>
                <p className="text-muted-foreground">
                  We employ industry-standard security measures including:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-muted-foreground">
                  <li>End-to-end encryption for all data transmission</li>
                  <li>Secure cloud storage with military-grade encryption</li>
                  <li>Multi-factor authentication and access controls</li>
                  <li>Regular security audits and compliance monitoring</li>
                  <li>Automatic data purging after document completion</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. TERM AND TERMINATION</h3>
                <p className="text-muted-foreground">
                  This Agreement shall remain in effect for a period of five (5) years from the date 
                  of acceptance or until all Confidential Information is returned or destroyed, 
                  whichever is later. The obligations of confidentiality shall survive termination 
                  of this Agreement.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5. GOVERNING LAW</h3>
                <p className="text-muted-foreground">
                  This Agreement shall be governed by and construed in accordance with the laws 
                  of the jurisdiction where the trust is to be established, without regard to 
                  conflict of law principles.
                </p>
              </div>

              <div className="border-t pt-4 mt-6">
                <p className="text-xs text-muted-foreground">
                  By proceeding with our service, you acknowledge that you have read, 
                  understood, and agree to be bound by the terms of this Non-Disclosure Agreement.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              id="nda-acceptance"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label
              htmlFor="nda-acceptance"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read, understood, and agree to the terms of this Non-Disclosure Agreement
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} disabled={!accepted} size="lg">
          Accept & Continue to Payment
        </Button>
      </div>
    </div>
  );
};

export default StepNDA;