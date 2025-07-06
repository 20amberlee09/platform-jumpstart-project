import PDFShift from 'pdfshift';

export interface DocumentTemplateData {
  ministerName: string;
  trustName: string;
  todayDate: string;
  identityData: any;
  trustData: any;
  gmailData: any;
  verificationData: any;
  barcodeImageUrl?: string;
  driveQRImageUrl?: string;
  blockchainTxHash?: string;
}

export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter';
  margin?: string;
  orientation?: 'portrait' | 'landscape';
  footer?: string;
  header?: string;
}

class PDFShiftService {
  private client: any;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new PDFShift(apiKey);
  }

  /**
   * Generate PDF from HTML template with user data injection
   */
  async generatePDF(
    templateHtml: string, 
    data: DocumentTemplateData, 
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    try {
      console.log('PDFShift: Starting PDF generation');
      
      // Inject data into template
      const processedHtml = this.processTemplate(templateHtml, data);
      
      // Default PDF options
      const pdfOptions = {
        source: processedHtml,
        format: options.format || 'A4',
        margin: options.margin || '0.5in',
        orientation: options.orientation || 'portrait',
        sandbox: true,
        delay: 1000, // Wait for CSS/images to load
        ...options
      };

      console.log('PDFShift: Sending request to API');
      const pdfBuffer = await this.client.convert(pdfOptions);
      
      console.log('PDFShift: PDF generated successfully');
      return pdfBuffer;
    } catch (error) {
      console.error('PDFShift: PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Process HTML template by injecting user data
   */
  private processTemplate(templateHtml: string, data: DocumentTemplateData): string {
    let processedHtml = templateHtml;

    // Replace all placeholder variables
    const replacements = {
      '{{ministerName}}': data.ministerName || '[Minister Name]',
      '{{trustName}}': data.trustName || '[Trust Name]',
      '{{todayDate}}': data.todayDate || new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      '{{fullName}}': data.identityData?.fullName || data.ministerName || '[Full Name]',
      '{{address}}': data.identityData?.address || '[Address]',
      '{{city}}': data.identityData?.city || '[City]',
      '{{state}}': data.identityData?.state || '[State]',
      '{{zipCode}}': data.identityData?.zipCode || '[Zip Code]',
      '{{gmailAccount}}': data.gmailData?.gmailAccount || '[Gmail Account]',
      '{{googleDriveFolder}}': data.gmailData?.googleDriveFolder || '[Google Drive Folder]',
      '{{barcodeNumber}}': data.verificationData?.barcodeNumber || '[Barcode Number]',
      '{{blockchainTxHash}}': data.blockchainTxHash || '[Blockchain Hash]',
      '{{barcodeImageUrl}}': data.barcodeImageUrl || '',
      '{{driveQRImageUrl}}': data.driveQRImageUrl || ''
    };

    // Apply all replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedHtml = processedHtml.replace(new RegExp(placeholder, 'g'), value);
    });

    return processedHtml;
  }

  /**
   * Create default HTML template for Certificate of Trust
   */
  static createCertificateTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Trust</title>
    <style>
        @page {
            size: A4;
            margin: 0.75in;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
            margin: 0;
            padding: 0;
        }
        
        .letterhead {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .letterhead h1 {
            font-size: 16pt;
            font-weight: bold;
            margin: 0 0 5px 0;
            letter-spacing: 1px;
        }
        
        .letterhead p {
            font-size: 10pt;
            margin: 2px 0;
            color: #333;
        }
        
        .document-title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            margin: 20px 0 30px 0;
            text-decoration: underline;
        }
        
        .content {
            text-align: justify;
            margin-bottom: 40px;
        }
        
        .section {
            margin-bottom: 20px;
        }
        
        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .subsection {
            margin-left: 20px;
            margin-bottom: 8px;
        }
        
        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            width: 300px;
            margin: 20px 0 10px 0;
        }
        
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 80px;
            border-top: 1px solid #ccc;
            padding: 10px 0;
            font-size: 8pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .footer-left, .footer-center, .footer-right {
            flex: 1;
            text-align: center;
        }
        
        .qr-code, .barcode {
            max-width: 60px;
            max-height: 60px;
        }
        
        .verification-box {
            border: 1px solid #000;
            padding: 15px;
            margin: 20px 0;
            background-color: #f9f9f9;
        }
        
        .verification-items {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
        }
        
        .verification-item {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="letterhead">
        <h1>ECCLESIASTICAL TRUST SERVICES</h1>
        <p>Professional Trust Administration • Legal Document Services</p>
        <p>Blockchain-Verified Document Authentication</p>
    </div>

    <div class="document-title">
        CERTIFICATE OF TRUST (SUMMARY)
    </div>

    <div class="content">
        <p>This Certificate is executed by <strong>{{ministerName}}</strong>, as Trustee of the <strong>{{trustName}}</strong>, established on {{todayDate}}.</p>

        <div class="section">
            <div class="section-title">1. TRUST EXISTENCE:</div>
            <div class="subsection">The Trust named above is validly existing under ecclesiastical law and pursuant to a trust agreement dated {{todayDate}}.</div>
        </div>

        <div class="section">
            <div class="section-title">2. TRUSTEE AUTHORITY:</div>
            <div class="subsection">The undersigned Trustee has full power and authority to act on behalf of the Trust in all matters related to trust administration, including:</div>
            <div class="subsection">• Acquiring, holding, and disposing of trust property</div>
            <div class="subsection">• Entering into contracts and agreements</div>
            <div class="subsection">• Managing trust assets and investments</div>
            <div class="subsection">• Distributing trust income and principal</div>
        </div>

        <div class="section">
            <div class="section-title">3. TRUST IDENTIFICATION:</div>
            <div class="subsection"><strong>Trust Name:</strong> {{trustName}}</div>
            <div class="subsection"><strong>Trustee:</strong> {{ministerName}}</div>
            <div class="subsection"><strong>Trust Email:</strong> {{gmailAccount}}</div>
            <div class="subsection"><strong>Document Repository:</strong> {{googleDriveFolder}}</div>
            <div class="subsection"><strong>Verification ID:</strong> {{barcodeNumber}}</div>
        </div>

        <div class="section">
            <div class="section-title">4. LIMITATION OF LIABILITY:</div>
            <div class="subsection">This Certificate is executed to facilitate transactions involving trust property and does not modify, revoke, or otherwise affect the terms of the Trust Agreement.</div>
        </div>

        <p><strong>IN WITNESS WHEREOF</strong>, the undersigned Trustee has executed this Certificate on {{todayDate}}.</p>

        <div class="signature-section">
            <div class="signature-line"></div>
            <p><strong>{{ministerName}}, Trustee</strong><br>
            {{trustName}}</p>
            
            <p><strong>Address:</strong><br>
            {{address}}<br>
            {{city}}, {{state}} {{zipCode}}</p>
        </div>

        <div class="verification-box">
            <div class="section-title">VERIFICATION ELEMENTS:</div>
            <div class="verification-items">
                <div class="verification-item">☑ Barcode Certificate Verification</div>
                <div class="verification-item">☑ Digital Repository Access</div>
                <div class="verification-item">☑ QR Code Authentication</div>
                <div class="verification-item">☑ Blockchain Verification</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="footer-left">
            {{#if barcodeImageUrl}}
            <img src="{{barcodeImageUrl}}" alt="Barcode QR" class="qr-code">
            {{/if}}
            <div>Certificate QR</div>
        </div>
        <div class="footer-center">
            <div>{{barcodeNumber}}</div>
            <div>Blockchain: {{blockchainTxHash}}</div>
        </div>
        <div class="footer-right">
            {{#if driveQRImageUrl}}
            <img src="{{driveQRImageUrl}}" alt="Drive QR" class="qr-code">
            {{/if}}
            <div>Drive Access QR</div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Create HTML template for Declaration of Trust
   */
  static createDeclarationTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Declaration of Trust</title>
    <style>
        @page {
            size: A4;
            margin: 0.75in;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
            margin: 0;
            padding: 0;
        }
        
        .letterhead {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .letterhead h1 {
            font-size: 16pt;
            font-weight: bold;
            margin: 0 0 5px 0;
            letter-spacing: 1px;
        }
        
        .document-title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            margin: 20px 0 30px 0;
            text-decoration: underline;
        }
        
        .content {
            text-align: justify;
            margin-bottom: 40px;
        }
        
        .article {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .article-title {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 10px;
            text-decoration: underline;
        }
        
        .signature-section {
            margin-top: 50px;
            page-break-inside: avoid;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            width: 300px;
            margin: 20px 0 10px 0;
        }

        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 80px;
            border-top: 1px solid #ccc;
            padding: 10px 0;
            font-size: 8pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .footer-left, .footer-center, .footer-right {
            flex: 1;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="letterhead">
        <h1>ECCLESIASTICAL TRUST SERVICES</h1>
        <p>Professional Trust Administration • Legal Document Services</p>
    </div>

    <div class="document-title">
        DECLARATION OF TRUST
    </div>

    <div class="content">
        <p>This Declaration of Trust is executed on {{todayDate}}, by <strong>{{ministerName}}</strong> ("Settlor" and "Trustee"), establishing the <strong>{{trustName}}</strong> ("Trust").</p>

        <div class="article">
            <div class="article-title">ARTICLE I - CREATION OF TRUST</div>
            <p>The Settlor hereby creates this Trust and designates the property described in Schedule A, attached hereto and incorporated by reference, as the initial trust estate. The Trust shall be administered according to ecclesiastical principles and the terms herein set forth.</p>
        </div>

        <div class="article">
            <div class="article-title">ARTICLE II - TRUSTEE POWERS</div>
            <p>The Trustee shall have all powers necessary for the administration of the Trust, including but not limited to:</p>
            <p>1. To hold, manage, invest, and reinvest trust property;</p>
            <p>2. To collect income and make distributions;</p>
            <p>3. To buy, sell, lease, mortgage, or otherwise deal with trust property;</p>
            <p>4. To maintain records and provide accountings as required;</p>
            <p>5. To defend or prosecute legal proceedings involving the Trust.</p>
        </div>

        <div class="article">
            <div class="article-title">ARTICLE III - DISTRIBUTIONS</div>
            <p>The Trustee may distribute income and principal to the beneficiaries as deemed appropriate in the Trustee's sole discretion, considering the best interests of all beneficiaries and the ecclesiastical purposes of the Trust.</p>
        </div>

        <div class="article">
            <div class="article-title">ARTICLE IV - REVOCATION</div>
            <p>This Trust is revocable and may be amended or revoked by the Settlor at any time during the Settlor's lifetime by written instrument delivered to the Trustee.</p>
        </div>

        <div class="article">
            <div class="article-title">ARTICLE V - GOVERNING LAW</div>
            <p>This Trust shall be governed by ecclesiastical law principles and the laws of the state where the Trust is administered, insofar as such laws do not conflict with ecclesiastical principles.</p>
        </div>

        <div class="signature-section">
            <p><strong>IN WITNESS WHEREOF</strong>, the undersigned has executed this Declaration of Trust on the date first written above.</p>
            
            <div class="signature-line"></div>
            <p><strong>{{ministerName}}</strong><br>
            Settlor and Trustee<br>
            {{trustName}}</p>
            
            <p><strong>Address:</strong><br>
            {{address}}<br>
            {{city}}, {{state}} {{zipCode}}</p>
        </div>
    </div>

    <div class="footer">
        <div class="footer-left">
            {{#if barcodeImageUrl}}
            <img src="{{barcodeImageUrl}}" alt="Barcode QR" class="qr-code">
            {{/if}}
            <div>Certificate QR</div>
        </div>
        <div class="footer-center">
            <div>{{barcodeNumber}}</div>
            <div>Blockchain: {{blockchainTxHash}}</div>
        </div>
        <div class="footer-right">
            {{#if driveQRImageUrl}}
            <img src="{{driveQRImageUrl}}" alt="Drive QR" class="qr-code">
            {{/if}}
            <div>Drive Access QR</div>
        </div>
    </div>
</body>
</html>`;
  }
}

export { PDFShiftService };