import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, CheckCircle, QrCode, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProgress } from '@/hooks/useUserProgress';
import DocumentUpload from '@/components/DocumentUpload';

interface StepVerificationToolsProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepVerificationTools = ({ onNext, onPrev, data }: StepVerificationToolsProps) => {
  const [barcodeUploaded, setBarcodeUploaded] = useState(false);
  const [googleDriveUrl, setGoogleDriveUrl] = useState(data?.googleDriveUrl || '');
  const [trustEmail, setTrustEmail] = useState(data?.trustEmail || '');
  const [verificationStatus, setVerificationStatus] = useState({
    barcode: false,
    email: false,
    drive: false
  });
  
  const { toast } = useToast();

  const handleBarcodeUpload = async (fileUrl: string, fileName: string) => {
    setBarcodeUploaded(true);
    const newStatus = { ...verificationStatus, barcode: true };
    setVerificationStatus(newStatus);

    toast({
      title: "Barcode Certificate Uploaded",
      description: "Certificate processed successfully",
    });
  };

  const handleEmailChange = async (email: string) => {
    setTrustEmail(email);
    const isValid = email.includes('@gmail.com') && email.includes('trust');
    const newStatus = { ...verificationStatus, email: isValid };
    setVerificationStatus(newStatus);
  };

  const handleDriveUrlChange = async (url: string) => {
    setGoogleDriveUrl(url);
    const isValid = url.includes('drive.google.com') && url.includes('share');
    const newStatus = { ...verificationStatus, drive: isValid };
    setVerificationStatus(newStatus);
  };

  const openBarcodeLink = () => {
    window.open('https://www.barcodestalk.com/bar-code-numbers', '_blank');
    toast({
      title: "Opening Barcode Purchase",
      description: "Complete your purchase and upload the certificate",
    });
  };

  const canProceed = Object.values(verificationStatus).every(status => status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Verification Tools Setup
            {canProceed && <Badge variant="secondary">Complete</Badge>}
          </CardTitle>
          <CardDescription>
            Set up the verification tools needed for your trust documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barcode Certificate */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Barcode Certificate ($5)
            </h3>
            <p className="text-muted-foreground">
              Purchase a barcode certificate for document verification
            </p>
            
            <Button onClick={openBarcodeLink} className="w-full mb-4">
              <ExternalLink className="mr-2 h-4 w-4" />
              Purchase Barcode Certificate ($5)
            </Button>

            {!barcodeUploaded ? (
              <DocumentUpload
                onUploadSuccess={handleBarcodeUpload}
                acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                maxSizeInMB={5}
                uploadPath="certificates/barcode"
                documentType="barcode_certificate"
              />
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Barcode certificate uploaded</span>
              </div>
            )}
          </div>

          {/* Trust Email Setup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Trust Email Setup
            </h3>
            <p className="text-muted-foreground">
              Create a Gmail account for your trust (must include "trust" in the name)
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="trustEmail">Trust Gmail Address</Label>
              <Input
                id="trustEmail"
                type="email"
                placeholder="mytrust@gmail.com"
                value={trustEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={verificationStatus.email ? "border-green-500" : ""}
              />
              {verificationStatus.email && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Valid trust email format</span>
                </div>
              )}
            </div>
          </div>

          {/* Google Drive Setup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Google Drive Folder</h3>
            <p className="text-muted-foreground">
              Create a shared Google Drive folder for your trust documents
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="driveUrl">Google Drive Share Link</Label>
              <Input
                id="driveUrl"
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={googleDriveUrl}
                onChange={(e) => handleDriveUrlChange(e.target.value)}
                className={verificationStatus.drive ? "border-green-500" : ""}
              />
              {verificationStatus.drive && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Valid Google Drive link</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button 
          onClick={() => onNext({ barcodeUploaded, googleDriveUrl, trustEmail, verificationStatus })} 
          disabled={!canProceed}
          className={canProceed ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {canProceed ? "Continue to Document Generation" : "Complete Setup First"}
        </Button>
      </div>
    </div>
  );
};

export default StepVerificationTools;