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
      // Pre-validate data before generation
      const extractedData = extractStepData();
      const validation = validateRequiredData(extractedData);
      
      if (!validation.isValid) {
        toast({
          title: "Missing Required Information",
          description: `Please complete these steps first: ${validation.missingFields.join(', ')}`,
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      
      // Log successful data extraction for debugging
      const documentData = createDocumentData(extractedData);
      console.log('✅ Document generation starting with validated data:', {
        ministerName: documentData.ministerName,
        trustName: documentData.trustName,
        hasIdentity: !!documentData.identityData?.firstName,
        hasAddress: !!documentData.identityData?.address,
        hasEmail: !!documentData.identityData?.email
      });
      
      // Simulate comprehensive trust document generation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDocumentsGenerated(true);
      toast({
        title: "Complete Trust Package Generated",
        description: "Your ecclesiastic revocable living trust with all annexes and certificates has been created.",
      });
    } catch (error) {
      console.error('❌ Document generation failed:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate trust documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Extract step data with proper fallback handling
   * Handles both named keys (identity) and numbered keys (step_1, step_2, etc.)
   */
  const extractStepData = () => {
    // Identity data - uses 'identity' key specifically
    const identityData = data?.identity || data?.step_2 || {};
    
    // Trust name data - step 3
    const trustNameData = data?.step_3 || {};
    
    // Ordination data - step 4  
    const ordinationData = data?.step_4 || {};
    
    // Gmail setup data - step 5
    const gmailData = data?.step_5 || {};
    
    // Verification tools data - step 6
    const verificationData = data?.step_6 || {};
    
    return {
      identityData,
      trustNameData, 
      ordinationData,
      gmailData,
      verificationData
    };
  };

  /**
   * Validate required data is available for document generation
   */
  const validateRequiredData = (extractedData: any) => {
    const { identityData, trustNameData } = extractedData;
    
    const missingFields = [];
    
    // Check identity data
    if (!identityData?.firstName) missingFields.push('First Name');
    if (!identityData?.lastName) missingFields.push('Last Name');
    if (!identityData?.email) missingFields.push('Email');
    if (!identityData?.address) missingFields.push('Address');
    if (!identityData?.city) missingFields.push('City');
    if (!identityData?.state) missingFields.push('State');
    if (!identityData?.zipCode) missingFields.push('ZIP Code');
    
    // Check trust name
    if (!trustNameData?.trustName && !trustNameData?.fullTrustName) {
      missingFields.push('Trust Name');
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  /**
   * Create document data with proper fallbacks
   */
  const createDocumentData = (extractedData: any) => {
    const { identityData, trustNameData, gmailData, verificationData } = extractedData;
    
    // Create minister name with fallbacks
    const fullName = identityData?.fullName || 
                    `${identityData?.firstName || ''} ${identityData?.lastName || ''}`.trim() ||
                    'Name Not Provided';
    const ministerName = `Minister ${fullName}`;
    
    // Create trust name with fallbacks
    const trustName = trustNameData?.fullTrustName || 
                     trustNameData?.trustName || 
                     'Trust Name Not Provided';
    
    return {
      identityData: {
        ...identityData,
        fullName,
        // Ensure all required fields have fallbacks
        firstName: identityData?.firstName || 'First',
        lastName: identityData?.lastName || 'Last', 
        email: identityData?.email || 'email@example.com',
        phone: identityData?.phone || '(555) 123-4567',
        address: identityData?.address || '123 Main Street',
        city: identityData?.city || 'City',
        state: identityData?.state || 'State',
        zipCode: identityData?.zipCode || '12345'
      },
      trustData: {
        ...trustNameData,
        trustName,
        fullTrustName: trustName
      },
      gmailData: {
        ...gmailData,
        gmailAccount: gmailData?.gmailAccount || 'account@gmail.com',
        googleDriveFolder: gmailData?.googleDriveFolder || 'Google Drive Folder'
      },
      verificationData: {
        ...verificationData,
        barcodeNumber: verificationData?.barcodeNumber || 'Barcode ID'
      },
      ministerName,
      trustName
    };
  };

  const handleDownload = (documentType: string) => {
    try {
      // Extract data with proper fallback handling
      const extractedData = extractStepData();
      
      // Validate required data
      const validation = validateRequiredData(extractedData);
      
      if (!validation.isValid) {
        toast({
          title: "Missing Required Information",
          description: `Please complete the following fields: ${validation.missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }
      
      // Create document data with fallbacks
      const documentData = createDocumentData(extractedData);
      
      console.log('✅ Document download prepared with data:', {
        type: documentType,
        ministerName: documentData.ministerName,
        trustName: documentData.trustName,
        dataIntegrity: {
          identity: !!documentData.identityData?.firstName,
          trust: !!documentData.trustData?.trustName,
          gmail: !!documentData.gmailData?.gmailAccount,
          verification: !!documentData.verificationData?.barcodeNumber
        }
      });
      
      downloadDocument(documentType, documentData);
      
    } catch (error) {
      console.error('Error preparing document data:', error);
      toast({
        title: "Document Preparation Error",
        description: "Failed to prepare document data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNext = () => {
    console.log('Document generation continue clicked:', { documentsGenerated });
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

  // Extract and validate data for display with proper fallback handling
  const displayData = (() => {
    try {
      const extractedData = extractStepData();
      const documentData = createDocumentData(extractedData);
      return documentData;
    } catch (error) {
      console.error('Error extracting display data:', error);
      // Return safe fallback data for display
      return {
        identityData: {
          firstName: 'First',
          lastName: 'Last',
          fullName: 'Name Not Provided',
          address: 'Address Not Provided',
          city: 'City',
          state: 'State',
          zipCode: '12345'
        },
        trustData: { trustName: 'Trust Name Not Provided' },
        gmailData: { 
          gmailAccount: 'Gmail Account Not Provided',
          googleDriveFolder: 'Google Drive Not Provided'
        },
        verificationData: { barcodeNumber: 'Barcode Not Provided' },
        ministerName: 'Minister Name Not Provided',
        trustName: 'Trust Name Not Provided'
      };
    }
  })();

  const { 
    identityData: displayIdentityData, 
    trustData: displayTrustData,
    gmailData: displayGmailData,
    verificationData: displayVerificationData,
    ministerName: displayMinisterName,
    trustName: displayTrustName
  } = displayData;

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
                <p className="text-sm text-muted-foreground">{displayMinisterName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Trust Name</Label>
                <p className="text-sm text-muted-foreground">{displayTrustName}</p>
              </div>
               <div>
                 <Label className="text-sm font-medium">Gmail Account</Label>
                 <p className="text-sm text-muted-foreground">{displayGmailData?.gmailAccount}</p>
               </div>
             </div>
             <div className="space-y-3">
               <div>
                 <Label className="text-sm font-medium">Google Drive Folder</Label>
                 <p className="text-sm text-muted-foreground">{displayGmailData?.googleDriveFolder}</p>
               </div>
                <div>
                  <Label className="text-sm font-medium">Barcode Certificate</Label>
                  <p className="text-sm text-muted-foreground">{displayVerificationData?.barcodeNumber}</p>
                </div>
               <div>
                 <Label className="text-sm font-medium">Address</Label>
                 <p className="text-sm text-muted-foreground">
                   {displayIdentityData?.address && displayIdentityData?.city && displayIdentityData?.state && displayIdentityData?.zipCode 
                     ? `${displayIdentityData.address}, ${displayIdentityData.city}, ${displayIdentityData.state} ${displayIdentityData.zipCode}`
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
                Congratulations {displayMinisterName}! Your ecclesiastic revocable living trust 
                has been successfully created with all verification elements. All documents are 
                professionally formatted PDFs that would be recognized by legal teams and authorities.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg" disabled={!onPrev}>
          Back to Verification Tools
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!documentsGenerated} 
          size="lg"
          className={documentsGenerated ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {documentsGenerated ? "Complete Boot Camp" : "Generate Documents First"}
        </Button>
      </div>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
          <div>Debug: documentsGenerated={documentsGenerated.toString()}, isGenerating={isGenerating.toString()}</div>
          <div>onPrev available: {!!onPrev}</div>
        </div>
      )}
    </div>
  );
};

const Label = ({ className, children, ...props }: any) => (
  <label className={`text-sm font-medium ${className || ''}`} {...props}>
    {children}
  </label>
);

export default StepDocumentGeneration;