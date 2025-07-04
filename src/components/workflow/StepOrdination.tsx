import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, ExternalLink, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from './DocumentUpload';

interface StepOrdinationProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepOrdination = ({ onNext, onPrev, data }: StepOrdinationProps) => {
  const [isOrdained, setIsOrdained] = useState(data?.isOrdained || false);
  const [uploadedFiles, setUploadedFiles] = useState(data?.uploadedFiles || []);
  const { toast } = useToast();

  const documentRequirements = [
    {
      id: 'minister-certificate',
      name: 'Minister Certificate',
      description: 'Upload your ordination certificate from the ministry organization',
      required: true,
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    }
  ];

  const handleOrdinationComplete = () => {
    setIsOrdained(true);
    toast({
      title: "Congratulations, Minister!",
      description: "You are now ordained and will be referred to as Minister in all future documents.",
    });
  };


  const handleNext = () => {
    if (!isOrdained) {
      toast({
        title: "Ordination Required",
        description: "Please complete your ministerial ordination before continuing.",
        variant: "destructive"
      });
      return;
    }

    // Check if required certificate is uploaded
    const requiredUploads = documentRequirements.filter(req => req.required);
    const uploadedRequiredFiles = requiredUploads.filter(req => 
      uploadedFiles.some(file => file.requirementId === req.id)
    );

    if (uploadedRequiredFiles.length < requiredUploads.length) {
      toast({
        title: "Certificate Upload Required",
        description: "Please upload your minister certificate before continuing.",
        variant: "destructive"
      });
      return;
    }

    const ministerName = data?.fullName ? `Minister ${data.fullName}` : 'Minister';
    
    onNext({ 
      isOrdained: true,
      uploadedFiles,
      ministerName,
      ministerTitle: 'Minister'
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Award className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Ministerial Ordination</h2>
        <p className="text-muted-foreground">
          Obtain your certificate of ordination to proceed as a Minister
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Ordained Online</CardTitle>
          <CardDescription>
            Complete your free ministerial ordination through a recognized online organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold mb-2">Why Ordination is Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              As part of the TroothHurtz Boot Camp process, you must be ordained as a Minister. 
              This designation will be used in all future documents and correspondence within the platform.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Free online ordination through recognized organizations</li>
              <li>Legally valid ministerial credentials</li>
              <li>Required for ecclesiastic trust creation</li>
              <li>Your name will be prefixed with "Minister" in all documents</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Step-by-Step Ordination Process:</h4>
            
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h3 className="font-semibold mb-3 text-primary">Universal Life Church - Recommended</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Click "Get Ordained with ULC" button below</li>
                <li>On the ULC website, click "Get Ordained Now" (it's FREE)</li>
                <li>Fill in your personal information:
                  <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                    <li>Full legal name: <span className="font-mono bg-muted px-1 rounded">{data?.fullName || 'Your Full Name'}</span></li>
                    <li>Email address (use your regular email)</li>
                    <li>Mailing address for certificate delivery</li>
                  </ul>
                </li>
                <li>Choose your ministry preferences (any selection is fine)</li>
                <li>Review and submit your ordination application</li>
                <li>You'll receive immediate confirmation via email</li>
                <li>Print or download your ordination certificate</li>
                <li>Return here and upload your certificate below</li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Important Notes:</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>The ordination is completely FREE - no payment required</li>
                  <li>Your certificate is legally valid for trust purposes</li>
                  <li>The process takes about 5 minutes to complete</li>
                  <li>You can order physical certificates later if desired (for a fee)</li>
                </ul>
              </div>
            </div>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-between p-4 h-auto bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary/20 hover:border-primary/40"
                onClick={() => window.open('https://www.ulc.org/landing/get-ordained?gad_source=1&gad_campaignid=205062787&gbraid=0AAAAADnE_Z3wHYt5ZfJROY7BcLEQwaFqs&gclid=Cj0KCQjwiqbBBhCAARIsAJSfZkb1XS_ESaHMRTZQKFbUNQrCcJBRCPWZGAamT2vkgRYC5-G7cux-uDgaAmf7EALw_wcB', '_blank')}
              >
                <div className="text-left">
                  <p className="font-medium text-primary">Universal Life Church (RECOMMENDED)</p>
                  <p className="text-sm text-muted-foreground">FREE • Fast • Legally Valid</p>
                  <p className="text-xs text-green-600 font-medium">✓ Most Popular Choice</p>
                </div>
                <ExternalLink className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-between p-4 h-auto"
                onClick={() => window.open('https://www.open-ministry.org/', '_blank')}
              >
                <div className="text-left">
                  <p className="font-medium">Open Ministry</p>
                  <p className="text-sm text-muted-foreground">Interfaith ordination service</p>
                </div>
                <ExternalLink className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-between p-4 h-auto"
                onClick={() => window.open('https://www.themonastery.org/', '_blank')}
              >
                <div className="text-left">
                  <p className="font-medium">The Monastery</p>
                  <p className="text-sm text-muted-foreground">Non-denominational ordination</p>
                </div>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-800 mb-1">After Getting Ordained:</p>
              <p className="text-xs text-amber-700">
                Once you complete the ordination process, return here to confirm completion and upload your certificate.
              </p>
            </div>
            <Button
              onClick={handleOrdinationComplete}
              disabled={isOrdained}
              variant="neon-gold"
              className="w-full"
            >
              {isOrdained ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Ordination Complete
                </>
              ) : (
                <>
                  <Award className="mr-2 h-4 w-4" />
                  I Have Completed My Ordination
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isOrdained && (
        <DocumentUpload
          title="Document Upload"
          requirements={documentRequirements}
          uploadedFiles={uploadedFiles}
          onFilesChange={setUploadedFiles}
        />
      )}

      {isOrdained && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="font-medium text-green-800">
              Welcome, Minister {data?.fullName || ''}!
            </p>
          </div>
          <p className="text-sm text-green-700 mt-1">
            From this point forward, you will be referred to as "Minister" in all documents and communications.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          Back to Trust Name
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isOrdained} 
          size="lg"
          variant="neon-purple"
        >
          Continue to Gmail Setup
        </Button>
      </div>
    </div>
  );
};

export default StepOrdination;