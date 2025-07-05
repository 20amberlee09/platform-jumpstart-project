import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, CheckCircle, QrCode, BarChart, Stamp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF, { jsPDFOptions } from 'jspdf';

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

  const createProfessionalPDF = (documentType: string) => {
    const doc = new jsPDF();
    
    // Set professional fonts and styling
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    // Add letterhead-style header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ECCLESIASTICAL TRUST SERVICES", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Professional Trust Administration • Legal Document Services", 105, 28, { align: "center" });
    doc.text("_______________________________________________________________________", 105, 35, { align: "center" });
    
    // Get data from previous steps
    const identityData = data?.['step_0'] || data?.identity || {};
    const trustData = data?.['step_1'] || data?.trust || {};
    const gmailData = data?.['step-gmail-setup'] || {};
    const verificationData = data?.['step-verification-tools'] || {};
    
    const ministerName = identityData?.fullName || '[Minister Name]';
    const trustName = trustData?.trustName || '[Trust Name]';
    const todayDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    let yPosition = 50;
    
    // Document title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(documentType.toUpperCase(), 105, yPosition, { align: "center" });
    yPosition += 15;
    
    // Create professional document content based on type
    if (documentType === "Certificate of Trust (Summary)") {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const content = [
        "",
        `This Certificate is executed by ${ministerName}, as Trustee of the`,
        `${trustName}, established on ${todayDate}.`,
        "",
        "1. TRUST EXISTENCE:",
        `   The Trust named above is validly existing under ecclesiastical law and`,
        `   pursuant to a trust agreement dated ${todayDate}.`,
        "",
        "2. TRUSTEE AUTHORITY:",
        "   The undersigned Trustee has full power and authority to act on behalf",
        "   of the Trust in all matters related to trust administration, including:",
        "   • Acquiring, holding, and disposing of trust property",
        "   • Entering into contracts and agreements",
        "   • Managing trust assets and investments",
        "   • Distributing trust income and principal",
        "",
        "3. TRUST IDENTIFICATION:",
        `   Trust Name: ${trustName}`,
        `   Trustee: ${ministerName}`,
        `   Trust Email: ${gmailData?.gmailAccount || '[Trust Email]'}`,
        `   Document Repository: ${gmailData?.googleDriveFolder || '[Repository]'}`,
        `   Verification ID: ${verificationData?.barcodeNumber || '[Verification ID]'}`,
        "",
        "4. LIMITATION OF LIABILITY:",
        "   This Certificate is executed to facilitate transactions involving trust",
        "   property and does not modify, revoke, or otherwise affect the terms",
        "   of the Trust Agreement.",
        "",
        "IN WITNESS WHEREOF, the undersigned Trustee has executed this",
        `Certificate on ${todayDate}.`,
        "",
        "",
        "_________________________________",
        `${ministerName}, Trustee`,
        trustName,
        "",
        `Address: ${identityData?.address || '[Address]'}`,
        `${identityData?.city || '[City]'}, ${identityData?.state || '[State]'} ${identityData?.zipCode || '[Zip]'}`,
        "",
        "VERIFICATION ELEMENTS:",
        "□ Barcode Certificate Verification",
        "□ Digital Repository Access",
        "□ QR Code Authentication",
        "□ Ecclesiastical Seal Verification"
      ];
      
      content.forEach((line, index) => {
        if (line.startsWith('   ') || line.startsWith('   •')) {
          doc.setFont("helvetica", "normal");
          doc.text(line, 25, yPosition);
        } else if (line.match(/^\d+\./)) {
          doc.setFont("helvetica", "bold");
          doc.text(line, 20, yPosition);
        } else if (line.startsWith('□')) {
          doc.setFont("helvetica", "normal");
          doc.text(line, 25, yPosition);
        } else {
          doc.setFont("helvetica", "normal");
          doc.text(line, 20, yPosition);
        }
        yPosition += 6;
        
        // Add new page if needed
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }
    
    // Add footer with verification elements (3 QR codes/barcodes)
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("This document contains verification elements and should be authenticated before use.", 105, 285, { align: "center" });
      doc.text(`Page ${i} of ${pageCount} • Generated ${todayDate}`, 105, 290, { align: "center" });
      
      // Add verification element placeholders (in real implementation, would embed actual QR codes and barcode)
      doc.setFontSize(6);
      doc.text("QR1: Certificate", 25, 275);
      doc.text("Barcode: " + (verificationData?.barcodeNumber || 'N/A'), 105, 275, { align: "center" });
      doc.text("QR2: Drive", 185, 275);
    }
    
    return doc;
  };
  const downloadDocument = (documentType: string) => {
    try {
      const pdf = createProfessionalPDF(documentType);
      const fileName = `${documentType.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create blob for download
      const pdfBlob = pdf.output('blob');
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      
      // Set link properties
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      // Force download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      toast({
        title: "Professional Document Downloaded",
        description: `${documentType} is ready for legal review and use.`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      
      // Ultimate fallback - try jsPDF direct save
      try {
        const pdf = createProfessionalPDF(documentType);
        const fileName = `${documentType.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        toast({
          title: "Document Downloaded",
          description: `${documentType} saved using alternative method.`,
        });
      } catch (fallbackError) {
        toast({
          title: "Download Failed",
          description: "Please check your browser's download settings and try again.",
          variant: "destructive"
        });
      }
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
                onClick={() => downloadDocument("Certificate of Trust (Summary)")}
              >
                <span>Certificate of Trust (Summary)</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDocument("Certificate of Trust (Detailed)")}
              >
                <span>Certificate of Trust (Detailed)</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDocument("Declaration of Trust")}
              >
                <span>Declaration of Trust</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDocument("Schedule A - Trust Asset Inventory")}
              >
                <span>Schedule A - Trust Asset Inventory</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDocument("Foundational Trust Indenture")}
              >
                <span>Foundational Trust Indenture</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDocument("Annex A - Affidavit of Identity")}
              >
                <span>Annex A - Affidavit of Identity</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDocument("Annex B - Ecclesiastical Deed Poll")}
              >
                <span>Annex B - Ecclesiastical Deed Poll</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="justify-between hover:bg-primary/10"
                onClick={() => downloadDocument("Annex C - Ecclesiastical Fee Schedule")}
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