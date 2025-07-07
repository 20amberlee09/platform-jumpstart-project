import { supabase } from '@/integrations/supabase/client';

export class SimplePDFService {
  /**
   * Generate a simple PDF document using minimal HTML
   */
  static async generateSimplePDF(data: {
    ministerName: string;
    trustName: string;
    todayDate: string;
  }): Promise<Blob> {
    const simpleTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${data.trustName} - Certificate</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            margin: 40px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .content {
            margin: 40px 0;
        }
        .signature-section {
            margin-top: 60px;
            text-align: right;
        }
        .footer {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">CERTIFICATE OF TRUST</div>
        <div>Private Ministerial Trust</div>
    </div>
    
    <div class="content">
        <p><strong>Trust Name:</strong> ${data.trustName}</p>
        <p><strong>Minister:</strong> ${data.ministerName}</p>
        <p><strong>Date Issued:</strong> ${data.todayDate}</p>
        
        <p style="margin-top: 30px;">
            This document certifies the establishment of a private ministerial trust 
            in accordance with applicable laws and regulations.
        </p>
        
        <p>
            This certificate serves as official documentation of the trust's 
            formation and the minister's authority to act on behalf of the trust.
        </p>
    </div>
    
    <div class="signature-section">
        <div style="border-top: 1px solid #333; width: 200px; margin-left: auto; margin-bottom: 5px;"></div>
        <div>${data.ministerName}</div>
        <div>Authorized Minister</div>
    </div>
    
    <div class="footer">
        Generated on ${data.todayDate} - TruthHurtz Platform
    </div>
</body>
</html>`;

    const { data: pdfData, error } = await supabase.functions.invoke('test-simple-pdf', {
      body: { htmlContent: simpleTemplate }
    });

    if (error) {
      console.error('Simple PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }

    return new Blob([pdfData], { type: 'application/pdf' });
  }

  /**
   * Download a generated PDF blob
   */
  static downloadPDF(pdfBlob: Blob, filename: string) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate and download a simple certificate
   */
  static async generateAndDownload(data: {
    ministerName: string;
    trustName: string;
    todayDate?: string;
  }) {
    const documentData = {
      ...data,
      todayDate: data.todayDate || new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    try {
      const pdfBlob = await this.generateSimplePDF(documentData);
      const filename = `${data.trustName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`;
      this.downloadPDF(pdfBlob, filename);
      return { success: true, filename };
    } catch (error) {
      console.error('PDF generation and download failed:', error);
      throw error;
    }
  }
}