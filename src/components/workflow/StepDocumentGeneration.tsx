import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, CheckCircle, QrCode, BarChart, Stamp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StepDocumentGenerationProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepDocumentGeneration = ({ onNext, onPrev, data }: StepDocumentGenerationProps) => {
  const [documentsGenerated, setDocumentsGenerated] = useState(data?.documentsGenerated || false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateDocuments = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate document generation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDocumentsGenerated(true);
      toast({
        title: "Documents Generated Successfully",
        description: "Your trust documents have been created with all verification elements.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (!documentsGenerated) {
      toast({
        title: "Documents Required",
        description: "Please generate your documents before completing the process.",
        variant: "destructive"
      });
      return;
    }
    
    onNext({ 
      documentsGenerated: true,
      completionDate: new Date().toISOString()
    });
  };

  const ministerName = data?.ministerName || `Minister ${data?.fullName || ''}`;
  const trustName = data?.fullTrustName || 'Your Trust Name';

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Document Generation</h2>
        <p className="text-muted-foreground">
          Generate your final trust documents with all verification elements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Summary</CardTitle>
          <CardDescription>
            Review your information before generating final documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Minister Name</Label>
                <p className="text-sm text-muted-foreground">{ministerName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Trust Name</Label>
                <p className="text-sm text-muted-foreground">{trustName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Gmail Account</Label>
                <p className="text-sm text-muted-foreground">{data?.gmailAccount}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Google Drive Folder</Label>
                <p className="text-sm text-muted-foreground">{data?.googleDriveFolder}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Barcode Certificate</Label>
                <p className="text-sm text-muted-foreground">{data?.barcodeNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-muted-foreground">
                  {data?.address}, {data?.city}, {data?.state} {data?.zipCode}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Template</CardTitle>
          <CardDescription>
            Your documents will be generated using the official template with your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold mb-2">Documents to be Generated</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Ecclesiastic Revocable Living Trust Agreement</li>
              <li>Certificate of Trust</li>
              <li>All documents will include Minister designation</li>
              <li>Personal information automatically inserted</li>
            </ul>
          </div>

          <div className="p-4 bg-muted/50 border rounded-lg">
            <h4 className="font-medium mb-2">Document Footer Elements</h4>
            <div className="flex justify-between items-center text-sm">
              <div className="flex flex-col items-center">
                <QrCode className="h-6 w-6 text-primary mb-1" />
                <span>Barcode QR Code</span>
                <span className="text-xs text-muted-foreground">(Far Left)</span>
              </div>
              <div className="flex flex-col items-center">
                <BarChart className="h-6 w-6 text-primary mb-1" />
                <span>Barcode JPG</span>
                <span className="text-xs text-muted-foreground">(Center)</span>
              </div>
              <div className="flex flex-col items-center">
                <QrCode className="h-6 w-6 text-primary mb-1" />
                <span>Drive QR Code</span>
                <span className="text-xs text-muted-foreground">(Far Right)</span>
              </div>
            </div>
          </div>

          <Button
            onClick={generateDocuments}
            disabled={documentsGenerated || isGenerating}
            variant="neon-green"
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Documents...
              </>
            ) : documentsGenerated ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Documents Generated
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Trust Documents
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {documentsGenerated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Download Documents
            </CardTitle>
            <CardDescription>
              Your completed trust documents are ready for download
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button variant="outline" className="justify-between">
                <span>Ecclesiastic Revocable Living Trust Agreement</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                <span>Certificate of Trust</span>
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="font-medium text-green-800">Boot Camp Complete!</p>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Congratulations {ministerName}! Your ecclesiastic revocable living trust 
                has been successfully created with all verification elements.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          Back to Verification Tools
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!documentsGenerated} 
          size="lg"
          variant="neon-gold"
        >
          Complete Boot Camp
        </Button>
      </div>
    </div>
  );
};

const Label = ({ className, children, ...props }: any) => (
  <label className={`text-sm font-medium ${className || ''}`} {...props}>
    {children}
  </label>
);

export default StepDocumentGeneration;