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
        <h2 className="text-2xl font-bold mb-2">Digital Signatures, Seals & Notarization</h2>
        <p className="text-muted-foreground">
          Generate custom trust seals, collect digital signatures, and get notarized
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
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <h4 className="font-semibold text-amber-800 mb-2">🔒 Critical: Notarization Required</h4>
              <p className="text-sm text-amber-700 mb-3">
                All trust documents MUST be notarized to be legally binding. We strongly recommend using an <strong>online notary service</strong> for the following benefits:
              </p>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside mb-3">
                <li><strong>Digital Rights:</strong> You retain digital access to your notarized documents</li>
                <li><strong>Unlimited Reproductions:</strong> Recreate and reprint documents anytime without re-notarization</li>
                <li><strong>Permanent Digital Record:</strong> Your notary signature is digitally preserved</li>
                <li><strong>Convenience:</strong> Complete the process from home at any time</li>
              </ul>
              <p className="text-xs text-amber-600">
                <strong>Note:</strong> Physical notarization only provides one original document. If you need additional copies or reprints, you would need to get notarized again.
              </p>
            </div>
            
            {!signaturesComplete ? (
              <div className="text-center py-8">
                <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Generate Seals & Prepare for Notarization</h3>
                <p className="text-muted-foreground mb-6">
                  We'll create custom trust seals with QR codes, prepare signature collection, and guide you through the notarization process
                </p>
                <Button onClick={handleGenerateSeals} size="lg">
                  Generate Seals, Signatures & Notary Prep
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">Seals & Notary Prep Complete</h3>
                <p className="text-muted-foreground mb-6">
                  Custom seals, signature collection, and notary preparation are ready
                </p>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <h4 className="font-medium text-green-800 mb-2">📋 Next Steps for Notarization:</h4>
                  <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                    <li>Download your completed trust documents from the next step</li>
                    <li>Schedule an online notary appointment (recommended: NotaryCam, Proof, or DocuSign)</li>
                    <li>Have your government-issued ID ready for the notary session</li>
                    <li>The notary will witness your signatures and apply their digital seal</li>
                    <li>Save the notarized documents to your secure digital storage</li>
                  </ol>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
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
                  <div className="p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold">Notary Ready</h4>
                    <p className="text-sm text-muted-foreground">Prepared for notarization</p>
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