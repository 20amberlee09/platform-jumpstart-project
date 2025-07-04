import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, BarChart, Stamp, ExternalLink, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from './DocumentUpload';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface StepVerificationToolsProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepVerificationTools = ({ onNext, onPrev, data }: StepVerificationToolsProps) => {
  const { isDemoMode, getDummyData } = useDemoMode();
  const demoData = isDemoMode ? getDummyData('step-verification-tools') : {};
  
  const [qrCodeGenerated, setQrCodeGenerated] = useState(data?.qrCodeGenerated || demoData?.qrCodes?.length > 0 || false);
  const [barcodeObtained, setBarcodeObtained] = useState(data?.barcodeObtained || demoData?.barcodes?.length > 0 || false);
  const [driveQrCode, setDriveQrCode] = useState(data?.driveQrCode || demoData?.qrCodes?.[0]?.url || '');
  const [barcodeNumber, setBarcodeNumber] = useState(data?.barcodeNumber || demoData?.barcodes?.[0]?.code || '');
  
  // Create dummy files for demo mode
  const createDummyFiles = () => {
    if (!isDemoMode) return [];
    
    return [
      {
        id: 'demo-barcode-cert',
        file: new File(['dummy certificate content'], 'barcode-certificate.pdf', { type: 'application/pdf' }),
        requirementId: 'barcode-certificate'
      },
      {
        id: 'demo-barcode-img', 
        file: new File(['dummy image content'], 'barcode-image.jpg', { type: 'image/jpeg' }),
        requirementId: 'barcode-image'
      }
    ];
  };
  
  const [uploadedFiles, setUploadedFiles] = useState(data?.uploadedFiles || createDummyFiles());
  
  const { toast } = useToast();

  const documentRequirements = [
    {
      id: 'barcode-certificate',
      name: 'Barcode Certificate',
      description: 'Upload your purchased barcode certificate from a barcode service provider',
      required: true,
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    },
    {
      id: 'barcode-image',
      name: 'Barcode Image (JPG)',
      description: 'Upload the actual barcode image file provided with your certificate',
      required: true,
      acceptedTypes: ['.jpg', '.jpeg', '.png'],
      maxSize: 5
    }
  ];

  const generateQrCode = () => {
    // In real implementation, would generate actual QR code for Google Drive folder
    const qrCodeData = `https://drive.google.com/folder/${Math.random().toString(36).substring(7)}`;
    setDriveQrCode(qrCodeData);
    setQrCodeGenerated(true);
    
    toast({
      title: "QR Code Generated",
      description: "QR code for your Google Drive folder has been created.",
    });
  };

  const handleBarcodeObtained = () => {
    if (!barcodeNumber.trim()) {
      toast({
        title: "Barcode Number Required",
        description: "Please enter your barcode certificate number.",
        variant: "destructive"
      });
      return;
    }
    
    setBarcodeObtained(true);
    toast({
      title: "Barcode Certificate Confirmed",
      description: "Your barcode certificate has been confirmed.",
    });
  };

  const handleNext = () => {
    if (!qrCodeGenerated || !barcodeObtained) {
      toast({
        title: "Verification Tools Required", 
        description: "Please complete all verification tools before continuing.",
        variant: "destructive"
      });
      return;
    }

    // In demo mode, skip document upload requirement
    if (!isDemoMode) {
      const requiredUploads = documentRequirements.filter(req => req.required);
      const uploadedRequiredFiles = requiredUploads.filter(req => 
        uploadedFiles.some(file => file.requirementId === req.id)
      );

      if (uploadedRequiredFiles.length < requiredUploads.length) {
        toast({
          title: "Document Upload Required",
          description: "Please upload required documents before continuing.",
          variant: "destructive"
        });
        return;
      }
    }
    
    onNext({ 
      qrCodeGenerated: true,
      barcodeObtained: true,
      driveQrCode,
      barcodeNumber,
      uploadedFiles
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <QrCode className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Verification Tools</h2>
        <p className="text-muted-foreground">
          Generate QR codes, obtain barcode certificate, and create document seal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            Google Drive QR Code
          </CardTitle>
          <CardDescription>
            Generate QR code that links to your Google Drive folder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              This QR code will be placed on the far right of document footers to provide 
              direct access to your Google Drive folder.
            </p>
          </div>

          {driveQrCode && (
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="w-32 h-32 bg-white border-2 border-primary mx-auto mb-2 flex items-center justify-center">
                <QrCode className="h-16 w-16 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">QR Code Preview</p>
            </div>
          )}

          <Button
            onClick={generateQrCode}
            disabled={qrCodeGenerated}
            variant="neon-blue"
            className="w-full"
          >
            {qrCodeGenerated ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                QR Code Generated
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Barcode Certificate Purchase
          </CardTitle>
          <CardDescription>
            Purchase a barcode certificate in your trust name using your Minister title
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold mb-3 text-primary">Step-by-Step Barcode Purchase Process:</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Click "Purchase Barcode Certificate" button below</li>
              <li>On the Barcodes Talk website, select your barcode package</li>
              <li><strong className="text-red-600">IMPORTANT:</strong> When filling out the application form, use:
                <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                  <li>Name: <span className="font-mono bg-muted px-1 rounded">Minister {data?.fullName || 'Your Full Name'}</span></li>
                  <li>Organization: <span className="font-mono bg-muted px-1 rounded">{data?.fullTrustName || 'Your Trust Name'}</span></li>
                  <li>Address: Use your trust address from Step 2</li>
                </ul>
              </li>
              <li>Complete the payment process</li>
              <li>You will receive:
                <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                  <li>A barcode certificate (PDF)</li>
                  <li>A barcode image file (JPG)</li>
                  <li>Your unique barcode number</li>
                </ul>
              </li>
              <li>Download and save both files to your computer</li>
              <li>Return here and upload both documents below</li>
              <li>Enter your barcode number in the field provided</li>
            </ol>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2">⚠️ Critical Requirements:</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li><strong>Always use "Minister" before your name</strong> - this is required for trust purposes</li>
              <li>Use your full trust name as the organization</li>
              <li>The barcode will be embedded in all your trust documents</li>
              <li>Keep your barcode certificate and number secure</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcodeNumber">Barcode Certificate Number</Label>
            <Input
              id="barcodeNumber"
              value={barcodeNumber}
              onChange={(e) => setBarcodeNumber(e.target.value)}
              placeholder="Enter your barcode certificate number after purchase"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('https://www.barcodestalk.com/bar-code-numbers?ps_partner_key=cWxuczJrb2U3Mzg0NDY&ps_xid=fU9ab8lMIoFTz3&gsxid=fU9ab8lMIoFTz3&gspk=cWxuczJrb2U3Mzg0NDY', '_blank')}
              className="flex-1 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-primary/20 hover:border-primary/40"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Purchase Barcode Certificate
            </Button>
            <Button
              onClick={handleBarcodeObtained}
              disabled={barcodeObtained || !barcodeNumber}
              variant="neon-purple"
            >
              {barcodeObtained ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </div>

          {barcodeObtained && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <p className="text-sm font-medium text-green-800">
                  Barcode Certificate Confirmed: {barcodeNumber}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isDemoMode && (
        <DocumentUpload
          title="Required Documents"
          requirements={documentRequirements}
          uploadedFiles={uploadedFiles}
          onFilesChange={setUploadedFiles}
          className="mt-6"
        />
      )}

      {isDemoMode && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
            <p className="font-medium text-blue-800">Demo Mode: Documents Pre-loaded</p>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Barcode certificate and barcode image have been automatically loaded for demo purposes.
          </p>
        </div>
      )}


      {qrCodeGenerated && barcodeObtained && (isDemoMode || uploadedFiles.length >= documentRequirements.filter(r => r.required).length) && (
        <Card>
          <CardHeader>
            <CardTitle>Document Footer Preview</CardTitle>
            <CardDescription>
              Preview of how verification elements will appear on your documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <QrCode className="h-8 w-8 text-primary mb-1" />
                  <p className="text-xs">Barcode QR</p>
                </div>
                <div className="flex flex-col items-center">
                  <BarChart className="h-8 w-8 text-primary mb-1" />
                  <p className="text-xs">Barcode JPG</p>
                </div>
                <div className="flex flex-col items-center">
                  <QrCode className="h-8 w-8 text-primary mb-1" />
                  <p className="text-xs">Drive QR</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          Back to Gmail Setup
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!qrCodeGenerated || !barcodeObtained || (!isDemoMode && uploadedFiles.filter(f => documentRequirements.find(r => r.required && r.id === f.requirementId)).length < documentRequirements.filter(r => r.required).length)} 
          size="lg"
          variant="neon-gold"
        >
          Continue to Document Generation
        </Button>
      </div>
    </div>
  );
};

export default StepVerificationTools;