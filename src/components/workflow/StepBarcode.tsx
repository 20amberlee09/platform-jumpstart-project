import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, AlertCircle, FileText, Image, Barcode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from '@/components/DocumentUpload';

interface StepBarcodeProps {
  onNext: (stepData?: any) => void;
  onPrev?: () => void;
  data: any;
  courseConfig?: any;
  updateStepData?: (stepKey: string, data: any) => void;
  currentStepKey?: string;
}

const StepBarcode = ({ onNext, onPrev, data, updateStepData, currentStepKey }: StepBarcodeProps) => {
  const [certificateUploaded, setCertificateUploaded] = useState(false);
  const [barcodeImageUploaded, setBarcodeImageUploaded] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string>('');
  const [barcodeImageUrl, setBarcodeImageUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved step data
    const stepData = data?.[currentStepKey || 'barcode'];
    if (stepData) {
      setCertificateUploaded(stepData.certificateUploaded || false);
      setBarcodeImageUploaded(stepData.barcodeImageUploaded || false);
      setCertificateUrl(stepData.certificateUrl || '');
      setBarcodeImageUrl(stepData.barcodeImageUrl || '');
    }
  }, [data, currentStepKey]);

  useEffect(() => {
    // Auto-save step data when it changes
    if ((certificateUploaded || barcodeImageUploaded) && updateStepData && currentStepKey) {
      const stepData = {
        certificateUploaded,
        barcodeImageUploaded,
        certificateUrl,
        barcodeImageUrl
      };
      updateStepData(currentStepKey, stepData);
    }
  }, [certificateUploaded, barcodeImageUploaded, certificateUrl, barcodeImageUrl, currentStepKey, updateStepData]);

  const handleCertificateUpload = async (fileUrl: string, fileName: string, fileType: string) => {
    try {
      setIsProcessing(true);
      setCertificateUrl(fileUrl);
      setCertificateUploaded(true);

      toast({
        title: "Certificate Uploaded",
        description: "Barcode certificate uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload certificate",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarcodeImageUpload = async (fileUrl: string, fileName: string, fileType: string) => {
    try {
      setIsProcessing(true);
      setBarcodeImageUrl(fileUrl);
      setBarcodeImageUploaded(true);

      toast({
        title: "Barcode Image Uploaded",
        description: "Barcode image uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload barcode image",
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

  const canProceed = certificateUploaded && barcodeImageUploaded && certificateUrl && barcodeImageUrl;

  const handleNext = () => {
    if (canProceed) {
      onNext({
        certificateUploaded: true,
        barcodeImageUploaded: true,
        certificateUrl,
        barcodeImageUrl
      });
    } else {
      toast({
        title: "Uploads Required",
        description: "Please upload both barcode certificate and barcode image to continue.",
        variant: "destructive",
      });
    }
  };

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Barcode className="h-6 w-6" />
            Barcode Registration
            {canProceed && <Badge variant="secondary">Complete</Badge>}
          </CardTitle>
          <CardDescription>
            Purchase and register your unique barcode for product identification and tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Why Barcode Registration is Important</div>
                <div className="text-sm text-blue-600 mt-1">
                  A registered barcode provides unique identification for your trust products and enables 
                  proper tracking, verification, and compliance with industry standards.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">1</span>
            How to Get Your Barcode
          </CardTitle>
          <CardDescription>
            Follow these steps to purchase and register your barcode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                1
              </div>
              <div>
                <div className="font-medium">Visit GS1 or Authorized Provider</div>
                <div className="text-sm text-muted-foreground">
                  Go to GS1.org or another authorized barcode provider to purchase your unique barcode
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                2
              </div>
              <div>
                <div className="font-medium">Purchase Barcode License</div>
                <div className="text-sm text-muted-foreground">
                  Complete the purchase process and receive your barcode certificate and image files
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                3
              </div>
              <div>
                <div className="font-medium">Download Certificate & Barcode Image</div>
                <div className="text-sm text-muted-foreground">
                  Save both the official certificate (PDF) and the barcode image (PNG/JPG) files
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                4
              </div>
              <div>
                <div className="font-medium">Upload Both Files Below</div>
                <div className="text-sm text-muted-foreground">
                  Upload your certificate and barcode image to complete this step
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              onClick={() => window.open('https://www.gs1.org/barcodes', '_blank')}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit GS1 Barcode Registration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">2</span>
            Upload Barcode Certificate
            {certificateUploaded && <Badge variant="secondary">Uploaded</Badge>}
          </CardTitle>
          <CardDescription>
            Upload your official barcode registration certificate
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!certificateUploaded ? (
            <DocumentUpload
              onUploadSuccess={handleCertificateUpload}
              onUploadError={handleUploadError}
              acceptedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
              maxSizeInMB={10}
              uploadPath="certificates/barcode"
              documentType="barcode_certificate"
              disabled={isProcessing}
            />
          ) : (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-green-800">Barcode Certificate Uploaded</div>
                  <div className="text-sm text-green-600">Certificate uploaded successfully</div>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Barcode Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">3</span>
            Upload Barcode Image
            {barcodeImageUploaded && <Badge variant="secondary">Uploaded</Badge>}
          </CardTitle>
          <CardDescription>
            Upload the actual barcode image that will be used in your documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!barcodeImageUploaded ? (
            <DocumentUpload
              onUploadSuccess={handleBarcodeImageUpload}
              onUploadError={handleUploadError}
              acceptedTypes={['.png', '.jpg', '.jpeg']}
              maxSizeInMB={5}
              uploadPath="barcodes/images"
              documentType="barcode_image"
              disabled={isProcessing}
            />
          ) : (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <Image className="h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-green-800">Barcode Image Uploaded</div>
                  <div className="text-sm text-green-600">Barcode image uploaded successfully</div>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Completion Status */}
      {canProceed && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Barcode className="h-12 w-12 text-green-600" />
              </div>
              <div className="text-xl font-semibold text-green-800">
                Barcode Registration Complete!
              </div>
              <div className="text-green-600">
                Your barcode certificate and image have been uploaded successfully.
                Your barcode will be included in all generated documents.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={!onPrev || isProcessing}
          type="button"
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!canProceed || isProcessing}
          type="button"
          className={canProceed ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isProcessing ? "Processing..." : 
           canProceed ? "Continue to Document Generation" : "Upload Files to Continue"}
        </Button>
      </div>
    </div>
  );
};

export default StepBarcode;