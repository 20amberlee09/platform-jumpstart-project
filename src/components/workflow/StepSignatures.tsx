import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, FileText, QrCode, CheckCircle } from 'lucide-react';

interface StepSignaturesProps {
  onNext: () => void;
  onPrev?: () => void;
  data: any;
}

const StepSignatures = ({ onNext, onPrev, data }: StepSignaturesProps) => {
  const [signaturesComplete, setSignaturesComplete] = useState(false);

  const handleGenerateSeals = () => {
    // Simulate seal generation
    setTimeout(() => {
      setSignaturesComplete(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Award className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Digital Signatures & Seals</h2>
        <p className="text-muted-foreground">
          Generate custom trust seals and collect digital signatures
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Digital Authentication</CardTitle>
            <CardDescription>
              Create custom seals and collect required signatures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!signaturesComplete ? (
              <div className="text-center py-8">
                <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Generate Seals</h3>
                <p className="text-muted-foreground mb-6">
                  We'll create custom trust seals with QR codes and prepare signature collection
                </p>
                <Button onClick={handleGenerateSeals} size="lg">
                  Generate Seals & Signatures
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">Seals Generated Successfully</h3>
                <p className="text-muted-foreground mb-6">
                  Custom seals and signature collection are ready
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold">Trust Seal</h4>
                    <p className="text-sm text-muted-foreground">Custom seal with QR code</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold">Digital Signatures</h4>
                    <p className="text-sm text-muted-foreground">Collected and verified</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {signaturesComplete && (
        <div className="flex justify-between pt-6 max-w-2xl mx-auto">
          {onPrev && (
            <Button onClick={onPrev} variant="outline" size="lg">
              Back
            </Button>
          )}
          <Button onClick={onNext} size="lg">
            Continue to Review
          </Button>
        </div>
      )}
    </div>
  );
};

export default StepSignatures;