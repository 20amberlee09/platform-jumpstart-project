import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, CheckCircle, QrCode, Mail, AlertTriangle } from 'lucide-react';
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
    console.log('Barcode upload success:', { fileUrl, fileName });
    
    // Update state FIRST
    setBarcodeUploaded(true);
    const newStatus = { ...verificationStatus, barcode: true };
    setVerificationStatus(newStatus);

    toast({
      title: "Barcode Certificate Uploaded",
      description: "Certificate processed successfully - you can now proceed if all fields are complete",
    });
  };

  const handleEmailChange = async (email: string) => {
    console.log('Email changed:', email);
    setTrustEmail(email);
    const isValid = email.includes('@gmail.com') && email.includes('trust');
    const newStatus = { ...verificationStatus, email: isValid };
    setVerificationStatus(newStatus);
    
    if (isValid) {
      toast({
        title: "Valid Trust Email",
        description: "Trust email format is correct",
      });
    }
  };

  const handleDriveUrlChange = async (url: string) => {
    setGoogleDriveUrl(url);
    
    // Enhanced validation for Google Drive links
    const isDriveLink = url.includes('drive.google.com') && url.includes('folders');
    const hasShareParams = url.includes('/share') || url.includes('usp=sharing');
    
    const isValid = isDriveLink && (hasShareParams || url.includes('/folders/'));
    
    const newStatus = { ...verificationStatus, drive: isValid };
    setVerificationStatus(newStatus);

    if (isValid) {
      toast({
        title: "Google Drive Link Valid",
        description: "Please ensure the folder has 'Editor' permissions for document upload",
      });
    }
  };

  const checkDrivePermissions = async (driveUrl: string) => {
    // This would ideally test the actual permissions, but for now we'll provide instructions
    toast({
      title: "Permission Check",
      description: "Please verify the folder allows editing by testing the link in an incognito window",
    });
  };

  const openBarcodeLink = () => {
    window.open('https://www.barcodestalk.com/bar-code-numbers', '_blank');
    toast({
      title: "Opening Barcode Purchase",
      description: "Complete your purchase and upload the certificate",
    });
  };

  const canProceed = barcodeUploaded && 
                   verificationStatus.barcode && 
                   verificationStatus.email && 
                   verificationStatus.drive &&
                   trustEmail.trim() !== '' &&
                   googleDriveUrl.trim() !== '';

  console.log('StepVerificationTools canProceed check:', {
    barcodeUploaded,
    verificationStatus,
    trustEmail: !!trustEmail.trim(),
    googleDriveUrl: !!googleDriveUrl.trim(),
    canProceed
  });

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

          {/* Google Drive Setup - Enhanced with Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Google Drive Folder Setup</h3>
            <p className="text-muted-foreground">
              Create a shared Google Drive folder for your trust documents with proper permissions
            </p>
            
            {/* Step-by-step Google Drive Instructions */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-medium mb-3">Step-by-Step Google Drive Setup:</h4>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs">1</span>
                  <div>
                    <div className="font-medium">Create Your Trust Folder</div>
                    <div className="text-blue-700">
                      Go to Google Drive and create a new folder named "{trustEmail ? trustEmail.replace('@gmail.com', '') : '[YourTrustName]'} Documents"
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs">2</span>
                  <div>
                    <div className="font-medium">Configure Folder Permissions</div>
                    <div className="text-blue-700">
                      Right-click the folder → "Share" → Change access to "Anyone with the link can edit"
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs">3</span>
                  <div>
                    <div className="font-medium">Copy the Share Link</div>
                    <div className="text-blue-700">
                      Click "Copy link" and paste it in the field below
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs">4</span>
                  <div>
                    <div className="font-medium">Verify Permissions</div>
                    <div className="text-blue-700">
                      Test the link in an incognito window to ensure it's accessible
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Permission Requirements Alert */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">Important Permission Requirements:</div>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• Folder must be set to "Anyone with the link can edit"</li>
                    <li>• This allows the platform to save your completed documents</li>
                    <li>• Without edit permissions, documents cannot be automatically uploaded</li>
                    <li>• You can change permissions back to private after document delivery</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="driveUrl">Google Drive Share Link</Label>
              <Input
                id="driveUrl"
                type="url"
                placeholder="https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j..."
                value={googleDriveUrl}
                onChange={(e) => handleDriveUrlChange(e.target.value)}
                className={verificationStatus.drive ? "border-green-500" : ""}
              />
              
              {/* Enhanced Validation */}
              {googleDriveUrl && (
                <div className="space-y-2">
                  {verificationStatus.drive ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Valid Google Drive link detected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Please ensure this is a proper Google Drive folder share link</span>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open(googleDriveUrl, '_blank')}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Test Link
                  </Button>
                </div>
              )}
            </div>
            
            {/* Permission Verification Helper */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium mb-2">How to Verify Permissions:</div>
              <ol className="text-xs text-muted-foreground space-y-1">
                <li>1. Copy your Google Drive link</li>
                <li>2. Open an incognito/private browser window</li>
                <li>3. Paste the link and press Enter</li>
                <li>4. You should see the folder and be able to upload files</li>
                <li>5. If you can't upload, the permissions need to be changed to "Editor"</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={!onPrev}>
          Previous
        </Button>
        <Button 
          onClick={() => {
            console.log('Verification Tools continue clicked, canProceed:', canProceed);
            if (canProceed) {
              onNext({ 
                barcodeUploaded, 
                googleDriveUrl, 
                trustEmail, 
                verificationStatus,
                completedAt: new Date().toISOString()
              });
            }
          }} 
          disabled={!canProceed}
          className={canProceed ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {canProceed ? "Continue to Document Generation" : "Complete Setup First"}
        </Button>
      </div>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
          <div>Debug: barcodeUploaded={barcodeUploaded.toString()}, email={verificationStatus.email.toString()}, drive={verificationStatus.drive.toString()}</div>
          <div>canProceed={canProceed.toString()}, onPrev available: {!!onPrev}</div>
        </div>
      )}
    </div>
  );
};

export default StepVerificationTools;