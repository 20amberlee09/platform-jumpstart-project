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

  const createLegalDocument = (documentType: string) => {
    const templates = {
      "Certificate of Trust (Summary)": `
CERTIFICATE OF TRUST (SUMMARY)

This Certificate is executed by ${ministerName}, as Trustee of the ${trustName}, established on ${new Date().toLocaleDateString()}.

1. TRUST EXISTENCE: The Trust named above is validly existing under the ecclesiastical laws and pursuant to a trust agreement dated ${new Date().toLocaleDateString()}.

2. TRUSTEE AUTHORITY: The undersigned Trustee has full power and authority to act on behalf of the Trust in all matters related to trust administration, including but not limited to:
   - Acquiring, holding, and disposing of trust property
   - Entering into contracts and agreements
   - Managing trust assets and investments
   - Distributing trust income and principal

3. TRUST IDENTIFICATION: 
   Trust Name: ${trustName}
   Trustee: ${ministerName}
   Gmail Account: ${gmailData?.gmailAccount || 'Not provided'}
   Google Drive: ${gmailData?.googleDriveFolder || 'Not provided'}
   Barcode ID: ${data?.['step-verification-tools']?.barcodeNumber || 'Not provided'}

4. LIMITATION OF LIABILITY: This Certificate is executed to facilitate transactions involving trust property and does not modify, revoke, or otherwise affect the terms of the Trust Agreement.

IN WITNESS WHEREOF, the undersigned Trustee has executed this Certificate as of the date first written above.

_________________________________
${ministerName}, Trustee
${trustName}

Address: ${identityData?.address || 'Not provided'}, ${identityData?.city || ''}, ${identityData?.state || ''} ${identityData?.zipCode || ''}

Ecclesiastical Verification Elements:
- QR Code: [Barcode QR Code would appear here]
- Barcode: [Barcode JPG would appear here]  
- Drive QR: [Google Drive QR Code would appear here]
      `,
      
      "Declaration of Trust": `
DECLARATION OF TRUST

KNOW ALL MEN BY THESE PRESENTS, that ${ministerName}, in the capacity of Grantor and initial Trustee, hereby declares and establishes this Ecclesiastic Revocable Living Trust under the following terms and conditions:

ARTICLE I - TRUST CREATION
This Trust Agreement is created on ${new Date().toLocaleDateString()}, for the purpose of managing and distributing assets according to ecclesiastical principles and the Grantor's wishes.

ARTICLE II - TRUST NAME AND PARTIES
1. Trust Name: ${trustName}
2. Grantor: ${ministerName}  
3. Initial Trustee: ${ministerName}
4. Trust Email: ${gmailData?.gmailAccount || 'Not provided'}
5. Document Repository: ${gmailData?.googleDriveFolder || 'Not provided'}

ARTICLE III - TRUST PURPOSES
This Trust is established for the following purposes:
a) To provide for the management and preservation of trust assets
b) To ensure proper distribution of trust property according to ecclesiastical law
c) To maintain continuity of asset management during the Grantor's lifetime
d) To provide for efficient transfer of assets upon the Grantor's transition

ARTICLE IV - TRUST PROPERTY
The Grantor hereby transfers and assigns to the Trustee the property described in Schedule A, attached hereto and incorporated by reference.

ARTICLE V - TRUSTEE POWERS
The Trustee shall have all powers necessary for the proper administration of this Trust, including but not limited to:
- Power to buy, sell, and manage real and personal property
- Power to invest and reinvest trust assets
- Power to distribute income and principal
- Power to enter into contracts and agreements
- Power to maintain detailed records and accounts

ARTICLE VI - REVOCATION AND AMENDMENT
This Trust may be revoked or amended by the Grantor at any time during their lifetime through written instrument delivered to the Trustee.

IN WITNESS WHEREOF, the Grantor has executed this Declaration of Trust on the date first written above.

_________________________________
${ministerName}
Grantor and Initial Trustee

Verification Elements:
Barcode Certificate ID: ${data?.['step-verification-tools']?.barcodeNumber || 'Not provided'}
Repository Location: ${gmailData?.googleDriveFolder || 'Not provided'}
      `,
      
      "Schedule A - Trust Asset Inventory": `
SCHEDULE A
TRUST ASSET INVENTORY TEMPLATE

${trustName}
Trustee: ${ministerName}
Date: ${new Date().toLocaleDateString()}

INSTRUCTIONS FOR ASSET INVENTORY:
Complete this schedule by listing all assets you wish to transfer into the trust. Update this document as assets are added or removed from the trust.

REAL ESTATE PROPERTIES:
□ Primary Residence
  Address: _________________________________
  Legal Description: _______________________
  Estimated Value: $________________________

□ Investment Properties
  Property 1: ______________________________
  Property 2: ______________________________
  Property 3: ______________________________

FINANCIAL ACCOUNTS:
□ Bank Accounts
  Institution: _____________________________
  Account Number: __________________________
  Type: ___________________________________
  Balance: $______________________________

□ Investment Accounts
  Institution: _____________________________
  Account Number: __________________________
  Type: ___________________________________
  Value: $_______________________________

PERSONAL PROPERTY:
□ Vehicles
  Vehicle 1: ______________________________
  Vehicle 2: ______________________________

□ Jewelry and Valuables
  Item: __________________________________
  Estimated Value: $______________________

□ Business Interests
  Business Name: ___________________________
  Ownership Percentage: ____________________
  Estimated Value: $______________________

INTELLECTUAL PROPERTY:
□ Patents, Copyrights, Trademarks
  Description: ____________________________
  Registration Number: ____________________

DIGITAL ASSETS:
□ Cryptocurrency Holdings
  Type: __________________________________
  Amount: ________________________________

□ Online Accounts and Digital Assets
  Platform: ______________________________
  Value: $______________________________

TOTAL ESTIMATED TRUST VALUE: $_______________

Trustee Signature: _________________________
Date: ____________________________________

Note: This inventory should be updated annually or whenever significant changes occur to trust assets.
      `,
      
      "Foundational Trust Indenture": `
FOUNDATIONAL TRUST INDENTURE

This Indenture, made this ${new Date().toLocaleDateString()}, between ${ministerName}, as Grantor, and ${ministerName}, as Trustee, of the ${trustName}.

RECITALS:
WHEREAS, Grantor desires to create a trust for the management and distribution of assets according to ecclesiastical principles; and
WHEREAS, Grantor wishes to appoint a competent Trustee to administer said trust; and
WHEREAS, the parties desire to set forth the fundamental terms and conditions governing this trust relationship;

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:

SECTION 1 - ESTABLISHMENT OF TRUST
The Grantor hereby establishes and creates a trust to be known as the "${trustName}", which shall be administered according to the terms of this Indenture and applicable law.

SECTION 2 - TRUST ADMINISTRATION
2.1 The Trustee shall administer the trust with the highest degree of care, skill, and diligence.
2.2 All trust administration activities shall be documented and stored in the designated repository: ${gmailData?.googleDriveFolder || 'Not provided'}
2.3 Regular communications regarding trust matters shall be conducted through: ${gmailData?.gmailAccount || 'Not provided'}

SECTION 3 - BENEFICIARY RIGHTS
Beneficiaries shall have the right to:
- Receive accountings of trust assets and activities
- Request information about trust administration
- Receive distributions according to trust terms
- Challenge actions that violate trust terms

SECTION 4 - TRUSTEE COMPENSATION
The Trustee shall be entitled to reasonable compensation for services rendered, as outlined in Annex C - Ecclesiastical Fee Schedule.

SECTION 5 - RECORD KEEPING
The Trustee shall maintain complete and accurate records of all trust transactions, including:
- Asset inventories and valuations
- Income and expense statements
- Distribution records
- Investment activities
- Correspondence and legal documents

SECTION 6 - VERIFICATION SYSTEMS
This trust employs multiple verification systems for authenticity:
- Barcode Certificate System (ID: ${data?.['step-verification-tools']?.barcodeNumber || 'Not provided'})
- Digital Repository Verification
- QR Code Authentication
- Ecclesiastical Seal Verification

IN WITNESS WHEREOF, the parties have executed this Indenture on the date first written above.

GRANTOR:                          TRUSTEE:
_________________________        _________________________
${ministerName}                   ${ministerName}

Address: ${identityData?.address || 'Not provided'}, ${identityData?.city || ''}, ${identityData?.state || ''} ${identityData?.zipCode || ''}
      `,
      
      "Annex A - Affidavit of Identity": `
ANNEX A
AFFIDAVIT OF IDENTITY AND TITLE RECLAMATION

STATE OF ${identityData?.state || '[STATE]'}
COUNTY OF ${identityData?.city || '[COUNTY]'}

I, ${ministerName}, being duly sworn, do hereby depose and state:

1. IDENTITY AFFIRMATION: I am the individual known as ${identityData?.fullName || 'Name Not Provided'}, and I am of sound mind and legal age to execute this affidavit.

2. ECCLESIASTICAL STANDING: I hold the ecclesiastical title of Minister and am authorized to act in such capacity for matters relating to the ${trustName}.

3. RESIDENTIAL ADDRESS: My primary residence is located at:
   ${identityData?.address || 'Address Not Provided'}
   ${identityData?.city || 'City Not Provided'}, ${identityData?.state || 'State Not Provided'} ${identityData?.zipCode || 'Zip Not Provided'}

4. TITLE RECLAMATION: I hereby reclaim and assert my natural, inalienable rights and sovereign capacity as a living being, specifically including:
   - The right to contract and enter into agreements
   - The right to hold and transfer property
   - The right to establish and administer trusts
   - The right to act in ecclesiastical capacity

5. TRUST AUTHORITY: I affirm that I have full authority to establish, fund, and administer the ${trustName} in accordance with ecclesiastical law and principles.

6. VERIFICATION SYSTEMS: This trust employs the following verification and authentication systems:
   - Gmail Account: ${gmailData?.gmailAccount || 'Not provided'}
   - Document Repository: ${gmailData?.googleDriveFolder || 'Not provided'}
   - Barcode Certificate: ${data?.['step-verification-tools']?.barcodeNumber || 'Not provided'}

7. OATH OF OFFICE: I solemnly swear to execute the duties of Trustee with integrity, diligence, and in accordance with the highest ethical standards.

This affidavit is made under penalty of perjury under the ecclesiastical laws.

_________________________________
${ministerName}
Minister and Trustee

Subscribed and sworn to before me this ${new Date().toLocaleDateString()}.

_________________________________
Notary Public / Ecclesiastical Witness
      `,
      
      "Annex B - Ecclesiastical Deed Poll": `
ANNEX B
ECCLESIASTICAL DEED POLL OF TRUSTEE AUTHORITY

This Deed Poll is executed by ${ministerName} on this ${new Date().toLocaleDateString()}, to establish and record ecclesiastical trustee authority.

DECLARATION OF AUTHORITY:

I, ${ministerName}, hereby declare and establish my authority as Trustee of the ${trustName} under ecclesiastical law and natural common law principles.

SECTION 1 - ECCLESIASTICAL FOUNDATION
This authority is established upon the foundation of:
1. Natural law and universal principles of justice
2. Ecclesiastical traditions and customs
3. Common law principles of trust administration
4. Divine guidance and spiritual discernment

SECTION 2 - SCOPE OF AUTHORITY
As Trustee, I am empowered to:
- Receive, hold, and manage trust property
- Make investments and financial decisions for the trust
- Distribute trust assets according to trust terms
- Enter into contracts and agreements on behalf of the trust
- Maintain records and provide accountings
- Defend the trust against claims and challenges

SECTION 3 - TRUST ADMINISTRATION STANDARDS
I covenant to administer this trust according to:
- The highest standards of fiduciary duty
- Ecclesiastical principles of stewardship
- Prudent investment and management practices
- Transparency and accountability to beneficiaries
- Regular prayer and spiritual guidance

SECTION 4 - VERIFICATION AND AUTHENTICATION
This trustee authority is verified through:
- Barcode Certificate System: ${data?.['step-verification-tools']?.barcodeNumber || 'Not provided'}
- Digital Repository: ${gmailData?.googleDriveFolder || 'Not provided'}
- Electronic Communication: ${gmailData?.gmailAccount || 'Not provided'}
- QR Code Verification System

SECTION 5 - SUCCESSION PROVISIONS
Upon my inability to serve, successor trustees shall be appointed according to the provisions set forth in the main trust document.

IN WITNESS WHEREOF, I have executed this Deed Poll under my hand and seal.

_________________________________
${ministerName}
Ecclesiastical Trustee

Date: ${new Date().toLocaleDateString()}
Location: ${identityData?.city || 'Not provided'}, ${identityData?.state || 'Not provided'}
      `,
      
      "Annex C - Ecclesiastical Fee Schedule": `
ANNEX C
ECCLESIASTICAL FEE SCHEDULE

${trustName}
Trustee: ${ministerName}
Effective Date: ${new Date().toLocaleDateString()}

This Fee Schedule establishes the compensation structure for trustee services rendered in the administration of the above-named trust.

SECTION 1 - BASIC TRUSTEE FEES
1.1 Annual Administrative Fee: 1.0% of trust assets (minimum $500)
    - Includes routine administration, record keeping, and beneficiary communications
    - Calculated annually based on average asset value

1.2 Distribution Processing Fee: $50 per distribution
    - Covers preparation, documentation, and processing of beneficiary distributions
    - Waived for routine scheduled distributions

1.3 Investment Management Fee: 0.5% of managed investment assets
    - Applied to actively managed investment portfolios
    - Excludes passive holdings and real estate

SECTION 2 - SPECIAL SERVICES FEES
2.1 Real Estate Management: $100 per month per property
    - Includes oversight, maintenance coordination, and tenant relations
    - Additional fees for major repairs or improvements

2.2 Business Interest Management: 2.0% of business income
    - For active management of business operations
    - Quarterly assessment and billing

2.3 Tax Preparation and Filing: $250 per return
    - Includes federal and state trust tax returns
    - Additional fees for complex tax situations

SECTION 3 - EXTRAORDINARY SERVICES
3.1 Legal Proceedings: $150 per hour
    - Court appearances, depositions, and legal research
    - Reasonable attorney fees reimbursed separately

3.2 Asset Acquisition/Disposition: 1.0% of transaction value
    - Applies to purchases and sales over $10,000
    - Minimum fee of $250 per transaction

3.3 Beneficiary Disputes: $150 per hour
    - Mediation, documentation, and resolution services
    - Capped at 10% of annual trust income

SECTION 4 - EXPENSE REIMBURSEMENTS
The trust shall reimburse the trustee for:
- Professional fees (attorneys, accountants, appraisers)
- Administrative expenses (postage, copying, filing fees)
- Travel expenses for trust business
- Insurance premiums for trustee liability coverage

SECTION 5 - FEE PAYMENT TERMS
- Fees are payable quarterly in arrears
- Extraordinary service fees are due within 30 days
- All fees are subject to beneficiary review and court approval if required
- Fee disputes shall be resolved through ecclesiastical mediation

SECTION 6 - FEE MODIFICATIONS
This fee schedule may be modified by written agreement between the trustee and beneficiaries, or by court order if required.

Trust Contact Information:
Email: ${gmailData?.gmailAccount || 'Not provided'}
Repository: ${gmailData?.googleDriveFolder || 'Not provided'}
Verification ID: ${data?.['step-verification-tools']?.barcodeNumber || 'Not provided'}

_________________________________
${ministerName}
Trustee

Date: ${new Date().toLocaleDateString()}
      `
    };
    
    return templates[documentType] || `${documentType}\n\nDocument content for ${documentType} would appear here.\n\nGenerated for: ${ministerName}\nTrust: ${trustName}\nDate: ${new Date().toLocaleDateString()}`;
  };
  
  const downloadDemoDocument = (documentName: string) => {
    if (!isDemoMode) {
      console.log('Not in demo mode, download blocked');
      return;
    }
    
    console.log('Starting download for:', documentName);
    
    try {
      const documentContent = createLegalDocument(documentName);
      console.log('Document content created, length:', documentContent.length);
      
      const blob = new Blob([documentContent], { type: 'text/plain' });
      console.log('Blob created:', blob.size, 'bytes');
      
      const url = URL.createObjectURL(blob);
      console.log('Object URL created:', url);
      
      const fileName = `${documentName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_()-]/g, '')}.txt`;
      console.log('Download filename:', fileName);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      console.log('Link added to DOM');
      
      // Force the download
      link.click();
      console.log('Link clicked');
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Cleanup completed');
      }, 100);
      
      toast({
        title: "Legal Document Downloaded",
        description: `${documentName} with full legal content has been saved as ${fileName}`,
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the document. Check console for details.",
        variant: "destructive"
      });
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