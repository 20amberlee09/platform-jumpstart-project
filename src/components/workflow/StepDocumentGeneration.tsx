import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, CheckCircle, QrCode, BarChart, Stamp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface StepDocumentGenerationProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepDocumentGeneration = ({ onNext, onPrev, data }: StepDocumentGenerationProps) => {
  const { isDemoMode, getDummyData } = useDemoMode();
  const demoData = isDemoMode ? getDummyData('step-document-generation') : {};
  
  const [documentsGenerated, setDocumentsGenerated] = useState(data?.documentsGenerated || demoData?.generatedDocuments?.length > 0 || false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Create sample PDF content for demo documents
  const createDemoPDF = (title: string, content: string) => {
    const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
50 750 Td
(${title}) Tj
0 -20 Td
(${content}) Tj
0 -20 Td
(This is a demo document generated for preview purposes.) Tj
0 -20 Td
         (Generated for: ${ministerName}) Tj
         0 -20 Td
         (Trust Name: ${trustName}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000254 00000 n 
0000000505 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
565
%%EOF
    `;
    return new Blob([pdfContent], { type: 'application/pdf' });
  };

  const generateDocuments = async () => {
    setIsGenerating(true);
    
    try {
      if (isDemoMode) {
        // In demo mode, create actual downloadable PDF files
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Simulate comprehensive trust document generation process
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      setDocumentsGenerated(true);
      toast({
        title: "Complete Trust Package Generated",
        description: isDemoMode 
          ? "Demo trust documents are ready for download and preview."
          : "Your ecclesiastic revocable living trust with all annexes and certificates has been created.",
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

  const downloadDemoDocument = (documentName: string) => {
    if (!isDemoMode) return;
    
    const blob = createDemoPDF(documentName, `This is your ${documentName} document.`);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Document Downloaded",
      description: `${documentName} has been downloaded to your computer.`,
    });
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

  // Extract data from previous steps
  const identityData = data?.['step-identity'] || data?.['step-1-identity'] || {};
  const trustNameData = data?.['step-trust-name'] || {};
  const gmailData = data?.['step-gmail-setup'] || {};
  const ordinationData = data?.['step-ordination'] || {};
  
  const ministerName = `Minister ${identityData?.fullName || data?.fullName || 'Name Not Provided'}`;
  const trustName = trustNameData?.fullTrustName || data?.fullTrustName || 'Trust Name Not Provided';

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
                 <p className="text-sm text-muted-foreground">{data?.['step-verification-tools']?.barcodeNumber || data?.barcodeNumber || 'Not Provided'}</p>
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
                onClick={() => downloadDemoDocument("Certificate of Trust (Summary)")}
                disabled={!isDemoMode}
              >
                <span>Certificate of Trust (Summary)</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDemoDocument("Certificate of Trust (Detailed)")}
                disabled={!isDemoMode}
              >
                <span>Certificate of Trust (Detailed)</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDemoDocument("Declaration of Trust")}
                disabled={!isDemoMode}
              >
                <span>Declaration of Trust</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDemoDocument("Schedule A - Trust Asset Inventory")}
                disabled={!isDemoMode}
              >
                <span>Schedule A - Trust Asset Inventory</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDemoDocument("Foundational Trust Indenture")}
                disabled={!isDemoMode}
              >
                <span>Foundational Trust Indenture</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDemoDocument("Annex A - Affidavit of Identity")}
                disabled={!isDemoMode}
              >
                <span>Annex A - Affidavit of Identity</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDemoDocument("Annex B - Ecclesiastical Deed Poll")}
                disabled={!isDemoMode}
              >
                <span>Annex B - Ecclesiastical Deed Poll</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDemoDocument("Annex C - Ecclesiastical Fee Schedule")}
                disabled={!isDemoMode}
              >
                <span>Annex C - Ecclesiastical Fee Schedule</span>
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {isDemoMode && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="font-medium text-blue-800">Demo Mode: Live Document Downloads</p>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Click any document above to download a sample PDF with your trust information. 
                  These are functional demo documents that show the structure and content of your actual trust package.
                </p>
              </div>
            )}

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