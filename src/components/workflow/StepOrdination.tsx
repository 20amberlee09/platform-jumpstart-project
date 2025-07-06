import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, FileText, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress } from '@/hooks/useUserProgress';
import DocumentUpload from '@/components/DocumentUpload';

interface StepOrdinationProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepOrdination = ({ onNext, onPrev, data }: StepOrdinationProps) => {
  const [isOrdained, setIsOrdained] = useState(data?.isOrdained || false);
  const [certificateUploaded, setCertificateUploaded] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user, updateMinisterStatus } = useAuth();

  const handleOrdinationClick = () => {
    window.open('https://www.ulc.org/landing/get-ordained', '_blank');
    
    toast({
      title: "Ordination Process Started",
      description: "Complete your ordination and return to upload your certificate.",
    });
  };

  const handleCertificateUpload = async (fileUrl: string, fileName: string, fileType: string) => {
    try {
      setIsProcessing(true);
      
      setCertificateUrl(fileUrl);
      setCertificateUploaded(true);

      if (user) {
        await updateMinisterStatus(true, fileUrl, user.user_metadata?.full_name);
      }

      toast({
        title: "Certificate Uploaded Successfully",
        description: "Your minister status has been activated!",
      });

      setIsOrdained(true);
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to process certificate",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadError = (error: string) => {
    toast({
      title: "Upload Failed",
      description: error,
      variant: "destructive"
    });
  };

  const canProceed = isOrdained && certificateUploaded;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Minister Ordination
            {canProceed && <Badge variant="secondary">Complete</Badge>}
          </CardTitle>
          <CardDescription>
            Get ordained as a minister to create legal trust documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Ordination Process */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Get Ordained</h3>
            <p className="text-muted-foreground">
              Complete the ordination process through our affiliate partner. This is required 
              to legally create and sign trust documents.
            </p>
            
            <Button 
              onClick={handleOrdinationClick}
              className="w-full"
              variant={isOrdained ? "secondary" : "default"}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {isOrdained ? "Ordination Complete" : "Start Ordination Process"}
            </Button>
            
            {isOrdained && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Ordination process completed</span>
              </div>
            )}
          </div>

          {/* Step 2: Certificate Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Upload Minister Certificate</h3>
            <p className="text-muted-foreground">
              Upload your official minister certificate (PDF format) to verify your ordination.
            </p>

            {!certificateUploaded ? (
              <DocumentUpload
                onUploadSuccess={handleCertificateUpload}
                onUploadError={handleUploadError}
                acceptedTypes={['.pdf']}
                maxSizeInMB={10}
                uploadPath="certificates/minister"
                documentType="minister_certificate"
                disabled={isProcessing}
              />
            ) : (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-800">Certificate Uploaded</div>
                    <div className="text-sm text-green-600">Minister status activated</div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </Card>
            )}
          </div>

          {/* Minister Status Confirmation */}
          {canProceed && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold text-blue-800">
                  🎉 Minister Status Activated!
                </div>
                <div className="text-sm text-blue-600">
                  You are now recognized as an ordained minister and can proceed with creating legal trust documents.
                </div>
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button 
          onClick={() => onNext({ isOrdained, certificateUploaded, certificateUrl })} 
          disabled={!canProceed}
          className={canProceed ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {canProceed ? "Continue as Minister" : "Complete Ordination First"}
        </Button>
      </div>
    </div>
  );
};

export default StepOrdination;