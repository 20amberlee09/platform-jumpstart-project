import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Upload, CheckCircle, AlertCircle, FileText, Clock, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import DocumentUpload from '@/components/DocumentUpload';

interface StepOrdinationProps {
  onNext: (stepData?: any) => void;
  onPrev?: () => void;
  data: any;
  courseConfig?: any;
  updateStepData?: (stepKey: string, data: any) => void;
  currentStepKey?: string;
}

const StepOrdination = ({ onNext, onPrev, data, updateStepData, currentStepKey }: StepOrdinationProps) => {
  const [isOrdained, setIsOrdained] = useState(false);
  const [certificateUploaded, setCertificateUploaded] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const { toast } = useToast();
  const { user, updateMinisterStatus } = useAuth();

  useEffect(() => {
    // Load saved step data
    const stepData = data?.[currentStepKey || 'ordination'];
    if (stepData) {
      setIsOrdained(stepData.isOrdained || false);
      setCertificateUploaded(stepData.certificateUploaded || false);
      setCertificateUrl(stepData.certificateUrl || '');
      if (stepData.certificateUploaded) {
        setShowInstructions(false);
      }
    }
  }, [data, currentStepKey]);

  useEffect(() => {
    // Auto-save when data changes (but only if we have meaningful data)
    if ((isOrdained || certificateUploaded || certificateUrl) && updateStepData && currentStepKey) {
      console.log('Auto-saving step data:', { isOrdained, certificateUploaded, certificateUrl });
      const stepData = {
        isOrdained,
        certificateUploaded,
        certificateUrl
      };
      
      // Use try-catch to prevent saving errors from breaking the component
      try {
        updateStepData(currentStepKey, stepData);
      } catch (error) {
        console.error('Error in auto-save:', error);
      }
    }
  }, [isOrdained, certificateUploaded, certificateUrl, updateStepData, currentStepKey]);

  useEffect(() => {
    // Ensure consistency - if we have a certificate uploaded, user should be considered ordained
    if (certificateUploaded && certificateUrl && !isOrdained) {
      console.log('Setting isOrdained to true due to certificate upload');
      setIsOrdained(true);
    }
  }, [certificateUploaded, certificateUrl, isOrdained]);

  const handleOrdinationClick = () => {
    // Open affiliate ordination link
    window.open('https://www.ulc.org/landing/get-ordained', '_blank');
    
    toast({
      title: "Ordination Process Started",
      description: "Complete your ordination and return to upload your certificate.",
    });
    
    setShowInstructions(false);
  };

  const handleCertificateUpload = async (fileUrl: string, fileName: string, fileType: string) => {
    console.log('Certificate upload started:', { fileUrl, fileName, fileType });
    
    try {
      setIsProcessing(true);
      
      // Update certificate status FIRST
      setCertificateUrl(fileUrl);
      setCertificateUploaded(true);
      setIsOrdained(true); // Set this to true when certificate is uploaded
      
      // Update minister status in auth
      if (user) {
        await updateMinisterStatus(true, fileUrl, user.user_metadata?.full_name);
        console.log('Minister status updated in auth');
      }
      
      console.log('State updated:', { 
        certificateUrl: fileUrl, 
        certificateUploaded: true, 
        isOrdained: true 
      });

      toast({
        title: "Certificate Uploaded Successfully",
        description: "Your minister status has been activated! You can now continue.",
      });

    } catch (error: any) {
      console.error('Certificate upload error:', error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to process certificate",
        variant: "destructive"
      });
      
      // Reset states on error
      setCertificateUrl('');
      setCertificateUploaded(false);
      setIsOrdained(false);
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

  const canProceed = certificateUploaded && certificateUrl && (isOrdained || certificateUploaded);
  
  console.log('StepOrdination state:', { 
    isOrdained, 
    certificateUploaded, 
    certificateUrl: !!certificateUrl, 
    canProceed, 
    isProcessing 
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            Minister Ordination
            {canProceed && <Badge variant="secondary">Complete</Badge>}
          </CardTitle>
          <CardDescription>
            Get ordained as a minister to create legal trust documents. This is quick, easy, and 100% legitimate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Why Minister Ordination is Required</div>
                <div className="text-sm text-blue-600 mt-1">
                  As an ordained minister, you gain the legal authority to create and sign trust documents. 
                  This ensures your trust documents are legally valid and recognized by banks, government agencies, and courts.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Instructions */}
      {showInstructions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">1</span>
              How to Get Ordained (It's Easier Than You Think!)
            </CardTitle>
            <CardDescription>
              Follow these simple steps to become an ordained minister in just a few minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Time Estimate */}
              <div className="flex items-center gap-2 text-green-600">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Estimated time: 3-5 minutes</span>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Click "Start Ordination Process" Below</div>
                    <div className="text-sm text-muted-foreground">
                      This will open our trusted ordination partner's website in a new tab
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Fill Out the Simple Form</div>
                    <div className="text-sm text-muted-foreground">
                      Provide your basic information (name, address, email). Takes about 2 minutes.
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Submit Your Application</div>
                    <div className="text-sm text-muted-foreground">
                      Click submit - approval is typically instant or within a few minutes
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    4
                  </div>
                  <div>
                    <div className="font-medium">Download Your Certificate</div>
                    <div className="text-sm text-muted-foreground">
                      Once approved, download your official minister ordination certificate (PDF format)
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    5
                  </div>
                  <div>
                    <div className="font-medium">Return Here and Upload Certificate</div>
                    <div className="text-sm text-muted-foreground">
                      Come back to this page and upload your certificate to activate your minister status
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="font-medium text-yellow-800 mb-2">Important Notes:</div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• The ordination is 100% legitimate and legally recognized</li>
                  <li>• Most applications are approved instantly</li>
                  <li>• You will receive an official PDF certificate</li>
                  <li>• This certificate gives you legal authority to sign trust documents</li>
                  <li>• Keep your certificate safe - you may need it for other legal purposes</li>
                </ul>
              </div>

              {/* Start Button */}
              <Button 
                onClick={handleOrdinationClick}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Start Ordination Process (Opens in New Tab)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">2</span>
            Upload Your Minister Certificate
            {certificateUploaded && <Badge variant="secondary">Uploaded</Badge>}
          </CardTitle>
          <CardDescription>
            Upload your official minister certificate to verify your ordination and proceed to the next step
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium text-red-800">Certificate Upload Required</div>
                <div className="text-sm text-red-600 mt-1">
                  You must upload your minister certificate to proceed to the next step. 
                  Without this certificate, you cannot continue with the trust creation process.
                </div>
              </div>
            </div>
          </div>

          {!certificateUploaded ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                After completing your ordination, download the certificate (PDF or image format) and upload it here:
              </div>
              
              <DocumentUpload
                onUploadSuccess={handleCertificateUpload}
                onUploadError={handleUploadError}
                acceptedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
                maxSizeInMB={10}
                uploadPath="certificates/minister"
                documentType="minister_certificate"
                disabled={isProcessing}
              />

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Upload Requirements:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• File must be in PDF, PNG, JPG, or JPEG format</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Certificate must be official and include your full name</li>
                  <li>• Ensure the document is clear and readable</li>
                </ul>
              </div>
            </div>
          ) : (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-green-800">Minister Certificate Uploaded</div>
                  <div className="text-sm text-green-600">Your minister status has been activated successfully</div>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Completion Status */}
      {(certificateUploaded && certificateUrl) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-green-600" />
              </div>
              <div className="text-xl font-semibold text-green-800">
                🎉 Congratulations, Minister!
              </div>
              <div className="text-green-600">
                You are now an ordained minister with the legal authority to create trust documents.
                All future documents will be signed with your minister credentials.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrev} 
          disabled={!onPrev || isProcessing}
        >
          Previous
        </Button>
        <Button 
          onClick={() => {
            console.log('Continue button clicked:', { certificateUploaded, certificateUrl });
            console.log('About to call onNext with data:', { 
              isOrdained: true,
              certificateUploaded: true,
              certificateUrl
            });
            
            // Force the step completion
            if (certificateUploaded && certificateUrl) {
              console.log('Calling onNext...');
              onNext({ 
                isOrdained: true,
                certificateUploaded: true,
                certificateUrl
              });
            } else {
              console.error('Button clicked but certificate not ready:', { certificateUploaded, certificateUrl });
            }
          }} 
          disabled={!certificateUploaded || !certificateUrl || isProcessing}
          className={certificateUploaded && certificateUrl ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isProcessing ? "Processing..." : 
           certificateUploaded && certificateUrl ? "Continue to Gmail Setup" : "Upload Certificate to Continue"}
        </Button>
      </div>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
          <div>Debug: isOrdained={isOrdained.toString()}, certificateUploaded={certificateUploaded.toString()}</div>
          <div>hasUrl={!!certificateUrl}, canProceed={canProceed.toString()}, isProcessing={isProcessing.toString()}</div>
          <div>onPrev available: {!!onPrev}, onNext available: {!!onNext}</div>
        </div>
      )}

      {/* Progress Indicator */}
      {!canProceed && (
        <div className="text-center text-sm text-muted-foreground">
          {!showInstructions && !certificateUploaded ? (
            "Waiting for certificate upload..."
          ) : !certificateUploaded ? (
            "Complete ordination and upload certificate to proceed"
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StepOrdination;