import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, CheckCircle, QrCode, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentDownload } from '@/hooks/useDocumentDownload';

interface StepDocumentGenerationProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepDocumentGeneration = ({ onNext, onPrev, data }: StepDocumentGenerationProps) => {
  const [documentsGenerated, setDocumentsGenerated] = useState(data?.documentsGenerated || false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { downloadDocument } = useDocumentDownload();

  const generateDocuments = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate comprehensive trust document generation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDocumentsGenerated(true);
      toast({
        title: "Complete Trust Package Generated",
        description: "Your ecclesiastic revocable living trust with all annexes and certificates has been created.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate trust documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (documentType: string) => {
    // Extract data from previous steps using numeric step keys
    const identityData = data?.['step_0'] || data?.['step_1'] || {}; // Identity step
    const trustNameData = data?.['step_2'] || data?.['step_3'] || {}; // Trust name step  
    const gmailData = data?.['step_4'] || data?.['step_5'] || {}; // Gmail setup step
    const verificationData = data?.['step_6'] || data?.['step_7'] || {}; // Verification tools step
    
    const ministerName = `Minister ${identityData?.fullName || data?.fullName || identityData?.name || 'Name Not Provided'}`;
    const trustName = trustNameData?.fullTrustName || trustNameData?.trustName || data?.fullTrustName || 'Trust Name Not Provided';
    
    const documentData = {
      identityData,
      trustData: trustNameData,
      gmailData,
      verificationData,
      ministerName,
      trustName
    };
    
    downloadDocument(documentType, documentData);
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

  // Extract data from previous steps using numeric step keys
  const identityData = data?.['step_0'] || data?.['step_1'] || {}; // Identity step
  const trustNameData = data?.['step_2'] || data?.['step_3'] || {}; // Trust name step
  const gmailData = data?.['step_4'] || data?.['step_5'] || {}; // Gmail setup step
  const ordinationData = data?.['step_6'] || data?.['step_7'] || {}; // Ordination step
  const verificationData = data?.['step_6'] || data?.['step_7'] || data?.['step_8'] || {}; // Verification tools step
  
  const ministerName = `Minister ${identityData?.fullName || data?.fullName || identityData?.name || 'Name Not Provided'}`;
  const trustName = trustNameData?.fullTrustName || trustNameData?.trustName || data?.fullTrustName || 'Trust Name Not Provided';

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Complete Trust Package Generation</h2>
        <p className="text-muted-foreground">
          Generate your complete ecclesiastic revocable living trust package with all certificates, annexes, and verification elements
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
                 <p className="text-sm text-muted-foreground">{gmailData?.gmailAccount || data?.gmailAccount || 'Not Provided'}</p>
               </div>
             </div>
             <div className="space-y-3">
               <div>
                 <Label className="text-sm font-medium">Google Drive Folder</Label>
                 <p className="text-sm text-muted-foreground">{gmailData?.googleDriveFolder || data?.googleDriveFolder || 'Not Provided'}</p>
               </div>
                <div>
                  <Label className="text-sm font-medium">Barcode Certificate</Label>
                  <p className="text-sm text-muted-foreground">{verificationData?.barcodeNumber || data?.barcodeNumber || 'Not Provided'}</p>
                </div>
               <div>
                 <Label className="text-sm font-medium">Address</Label>
                 <p className="text-sm text-muted-foreground">
                   {identityData?.address && identityData?.city && identityData?.state && identityData?.zipCode 
                     ? `${identityData.address}, ${identityData.city}, ${identityData.state} ${identityData.zipCode}`
                     : data?.address && data?.city && data?.state && data?.zipCode
                     ? `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`
                     : 'Address Not Provided'
                   }
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
            <h3 className="font-semibold mb-2">Complete Trust Package Documents</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Certificate of Trust (Summary & Detailed)</li>
              <li>Declaration of Trust</li>
              <li>Schedule A - Trust Asset Inventory Template</li>
              <li>Foundational Trust Indenture</li>
              <li>Annex A - Affidavit of Identity and Title Reclamation</li>
              <li>Annex B - Ecclesiastical Deed Poll of Trustee Authority</li>
              <li>Annex C - Ecclesiastical Fee Schedule</li>
              <li>All documents include Minister designation and personal information</li>
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
                Generate Complete Trust Package
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
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => handleDownload("Certificate of Trust (Summary)")}
              >
                <span>Certificate of Trust (Summary)</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => handleDownload("Certificate of Trust (Detailed)")}
              >
                <span>Certificate of Trust (Detailed)</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => handleDownload("Declaration of Trust")}
              >
                <span>Declaration of Trust</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => handleDownload("Schedule A - Trust Asset Inventory")}
              >
                <span>Schedule A - Trust Asset Inventory</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => handleDownload("Foundational Trust Indenture")}
              >
                <span>Foundational Trust Indenture</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => handleDownload("Annex A - Affidavit of Identity")}
              >
                <span>Annex A - Affidavit of Identity</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => handleDownload("Annex B - Ecclesiastical Deed Poll")}
              >
                <span>Annex B - Ecclesiastical Deed Poll</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => handleDownload("Annex C - Ecclesiastical Fee Schedule")}
              >
                <span>Annex C - Ecclesiastical Fee Schedule</span>
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
                has been successfully created with all verification elements. All documents are 
                professionally formatted PDFs that would be recognized by legal teams and authorities.
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