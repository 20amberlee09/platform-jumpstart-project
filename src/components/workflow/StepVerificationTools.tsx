import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, BarChart, Stamp, ExternalLink, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from './DocumentUpload';

interface StepVerificationToolsProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepVerificationTools = ({ onNext, onPrev, data }: StepVerificationToolsProps) => {
  const [qrCodeGenerated, setQrCodeGenerated] = useState(data?.qrCodeGenerated || false);
  const [barcodeObtained, setBarcodeObtained] = useState(data?.barcodeObtained || false);
  const [driveQrCode, setDriveQrCode] = useState(data?.driveQrCode || '');
  const [barcodeNumber, setBarcodeNumber] = useState(data?.barcodeNumber || '');
  const [uploadedFiles, setUploadedFiles] = useState(data?.uploadedFiles || []);
  
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
    },
    {
      id: 'seal-image',
      name: 'Ministry Seal Image',
      description: 'Upload your ministry seal/stamp image (create externally if needed)',
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
    const requiredUploads = documentRequirements.filter(req => req.required);
    const uploadedRequiredFiles = requiredUploads.filter(req => 
      uploadedFiles.some(file => file.requirementId === req.id)
    );

    if (!qrCodeGenerated || !barcodeObtained || uploadedRequiredFiles.length < requiredUploads.length) {
      toast({
        title: "Verification Tools Required",
        description: "Please complete all verification tools and upload required documents before continuing.",
        variant: "destructive"
      });
      return;
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
            Barcode Certificate
          </CardTitle>
          <CardDescription>
            Obtain barcode certificate in your trust name using Minister title
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold mb-2">Important Instructions</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Use your Minister title when filling out the barcode application</li>
              <li>Apply in the name of your trust: {data?.fullTrustName}</li>
              <li>You will receive both a barcode number and JPG image</li>
              <li>The barcode will be placed in the center of document footers</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcodeNumber">Barcode Certificate Number</Label>
            <Input
              id="barcodeNumber"
              value={barcodeNumber}
              onChange={(e) => setBarcodeNumber(e.target.value)}
              placeholder="Enter your barcode certificate number"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('https://www.gs1us.org/', '_blank')}
              className="flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Get Barcode Certificate
            </Button>
            <Button
              onClick={handleBarcodeObtained}
              disabled={barcodeObtained || !barcodeNumber}
              variant="neon-purple"
            >
              {barcodeObtained ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DocumentUpload
        title="Required Documents"
        requirements={documentRequirements}
        uploadedFiles={uploadedFiles}
        onFilesChange={setUploadedFiles}
        className="mt-6"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stamp className="h-5 w-5 mr-2" />
            Seal Creation Resources
          </CardTitle>
          <CardDescription>
            External tools to create your ministry seal if you don't have one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold mb-2">Seal Requirements</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Should include your Minister name and trust name</li>
              <li>Circular or official seal design recommended</li>
              <li>High resolution JPG/PNG format required</li>
              <li>Will be used on all official trust documents</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('https://www.canva.com/create/seals/', '_blank')}
              className="flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Create with Canva
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://www.logomakr.com/', '_blank')}
              className="flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              LogoMakr
            </Button>
          </div>
        </CardContent>
      </Card>

      {qrCodeGenerated && barcodeObtained && uploadedFiles.length >= documentRequirements.filter(r => r.required).length && (
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
          disabled={!qrCodeGenerated || !barcodeObtained || uploadedFiles.filter(f => documentRequirements.find(r => r.required && r.id === f.requirementId)).length < documentRequirements.filter(r => r.required).length} 
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