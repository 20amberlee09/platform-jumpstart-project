import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
            Non-Disclosure Agreement
          </CardTitle>
          <CardDescription>
            Please read the complete agreement below before proceeding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full border rounded-md p-4 mb-6 overflow-y-auto">
            <div className="prose prose-sm max-w-none text-foreground">
              <h3 className="text-lg font-semibold mb-4">NON-DISCLOSURE AGREEMENT</h3>
              
              <p className="mb-4">
                This Non-Disclosure Agreement ("Agreement") is entered into as of the date of acceptance 
                by the user ("Recipient") and TROOTHHURTZ ("Disclosing Party").
              </p>

              <h4 className="font-semibold mt-6 mb-2">1. DEFINITION OF CONFIDENTIAL INFORMATION</h4>
              <p className="mb-4">
                "Confidential Information" includes, but is not limited to: (a) all proprietary software, 
                source code, algorithms, methodologies, and technical processes; (b) business strategies, 
                financial information, and operational procedures; (c) legal document templates, trust 
                creation processes, and ecclesiastic methodologies; (d) customer data, user information, 
                and business relationships; (e) any intellectual property, trade secrets, or proprietary 
                knowledge disclosed through this platform; and (f) any information marked as confidential 
                or that would reasonably be considered confidential in nature.
              </p>

              <h4 className="font-semibold mt-6 mb-2">2. OBLIGATIONS OF RECIPIENT</h4>
              <p className="mb-4">
                Recipient agrees to: (a) hold all Confidential Information in strict confidence; 
                (b) not disclose any Confidential Information to third parties without prior written 
                consent; (c) use Confidential Information solely for the purpose of utilizing the 
                services provided by this platform; (d) take reasonable precautions to protect the 
                confidentiality of all disclosed information; and (e) not reverse engineer, decompile, 
                or attempt to derive the source code or underlying methodologies.
              </p>

              <h4 className="font-semibold mt-6 mb-2">3. INTELLECTUAL PROPERTY PROTECTION</h4>
              <p className="mb-4">
                All intellectual property rights in the platform, including but not limited to copyrights, 
                trademarks, trade secrets, patents, and proprietary methodologies, remain the exclusive 
                property of TROOTHHURTZ. Recipient acknowledges that no license or ownership rights are 
                granted except for the limited right to use the services as intended.
              </p>

              <h4 className="font-semibold mt-6 mb-2">4. PROPRIETARY KNOWLEDGE</h4>
              <p className="mb-4">
                The legal methodologies, trust creation processes, ecclesiastic procedures, document 
                automation systems, and verification protocols contained within this platform constitute 
                valuable proprietary knowledge developed by TROOTHHURTZ. Recipient agrees not to use 
                this knowledge to create competing services or to assist others in doing so.
              </p>

              <h4 className="font-semibold mt-6 mb-2">5. EXCEPTIONS</h4>
              <p className="mb-4">
                This Agreement does not apply to information that: (a) is or becomes publicly available 
                through no breach of this Agreement; (b) was rightfully known by Recipient prior to 
                disclosure; (c) is independently developed by Recipient without use of Confidential 
                Information; or (d) is required to be disclosed by law or court order.
              </p>

              <h4 className="font-semibold mt-6 mb-2">6. TERM AND SURVIVAL</h4>
              <p className="mb-4">
                This Agreement shall remain in effect indefinitely and shall survive termination of 
                the user's access to the platform. The obligations of confidentiality shall continue 
                for a period of ten (10) years following termination.
              </p>

              <h4 className="font-semibold mt-6 mb-2">7. REMEDIES</h4>
              <p className="mb-4">
                Recipient acknowledges that any breach of this Agreement may cause irreparable harm 
                to TROOTHHURTZ, and therefore TROOTHHURTZ shall be entitled to seek injunctive relief 
                and monetary damages without the need to post bond.
              </p>

              <h4 className="font-semibold mt-6 mb-2">8. GOVERNING LAW</h4>
              <p className="mb-4">
                This Agreement shall be governed by and construed in accordance with applicable state 
                and federal laws. Any disputes arising under this Agreement shall be subject to the 
                exclusive jurisdiction of the appropriate courts.
              </p>

              <p className="mt-6 font-medium">
                By checking the box below and proceeding, you acknowledge that you have read, 
                understood, and agree to be bound by all terms of this Non-Disclosure Agreement.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="nda-agreement" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="nda-agreement" className="text-sm font-medium leading-relaxed">
              I have read and understood the complete Non-Disclosure Agreement above, and I agree 
              to be legally bound by all of its terms and conditions, including the protection of 
              intellectual property and proprietary knowledge contained within this platform.
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