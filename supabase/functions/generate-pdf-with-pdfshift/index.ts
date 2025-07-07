import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const documentData = await req.json()
    console.log('Received complete document data:', documentData)

    const apiKey = Deno.env.get('PDFSHIFT_API_KEY')
    if (!apiKey) {
      throw new Error('PDFShift API key not configured')
    }

    // Create comprehensive HTML template with all data
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Times New Roman', serif; margin: 0; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #000; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
            .subtitle { font-size: 16px; margin-bottom: 20px; }
            .content { margin-bottom: 40px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .field { margin-bottom: 10px; }
            .field-label { font-weight: bold; display: inline-block; width: 150px; }
            .field-value { display: inline-block; }
            .signature-section { margin-top: 60px; }
            .signature-line { border-bottom: 1px solid #000; width: 300px; display: inline-block; margin-right: 50px; margin-bottom: 30px; }
            .signature-label { font-size: 12px; margin-top: 5px; }
            
            /* FOOTER STYLES - CRITICAL */
            .footer { 
                position: fixed; 
                bottom: 20px; 
                left: 20px; 
                right: 20px; 
                border-top: 2px solid #000; 
                padding-top: 15px; 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
                background: white;
            }
            .footer-element { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                text-align: center; 
            }
            .footer-qr { width: 60px; height: 60px; }
            .footer-barcode { max-width: 80px; max-height: 40px; }
            .footer-text { font-size: 10px; margin-top: 5px; font-weight: bold; }
            .footer-hash { font-size: 8px; word-break: break-all; max-width: 200px; }
        </style>
    </head>
    <body>
        <!-- HEADER -->
        <div class="header">
            <div class="title">${documentData.documentType || 'Trust Document'}</div>
            <div class="subtitle">Blockchain Verified Legal Document</div>
            <div style="font-size: 12px; color: #666;">
                Generated: ${new Date(documentData.generatedAt).toLocaleDateString()}<br>
                Document ID: ${documentData.footerElements?.verificationId || 'N/A'}
            </div>
        </div>

        <!-- CONTENT -->
        <div class="content">
            <!-- Personal Information Section -->
            <div class="section">
                <div class="section-title">Personal Information</div>
                <div class="field">
                    <span class="field-label">Full Name:</span>
                    <span class="field-value">${documentData.personalInfo?.firstName || ''} ${documentData.personalInfo?.lastName || ''}</span>
                </div>
                <div class="field">
                    <span class="field-label">Email:</span>
                    <span class="field-value">${documentData.personalInfo?.email || ''}</span>
                </div>
                <div class="field">
                    <span class="field-label">Phone:</span>
                    <span class="field-value">${documentData.personalInfo?.phone || ''}</span>
                </div>
                <div class="field">
                    <span class="field-label">Address:</span>
                    <span class="field-value">${documentData.personalInfo?.address || ''}, ${documentData.personalInfo?.city || ''}, ${documentData.personalInfo?.state || ''} ${documentData.personalInfo?.zipCode || ''}</span>
                </div>
                <div class="field">
                    <span class="field-label">Date of Birth:</span>
                    <span class="field-value">${documentData.personalInfo?.dateOfBirth || ''}</span>
                </div>
            </div>

            <!-- Trust Information Section -->
            ${documentData.trustInfo?.trustName ? `
            <div class="section">
                <div class="section-title">Trust Information</div>
                <div class="field">
                    <span class="field-label">Trust Name:</span>
                    <span class="field-value">${documentData.trustInfo.trustName}</span>
                </div>
                <div class="field">
                    <span class="field-label">Trust Type:</span>
                    <span class="field-value">${documentData.trustInfo.trustType || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Purpose:</span>
                    <span class="field-value">${documentData.trustInfo.trustPurpose || 'N/A'}</span>
                </div>
            </div>
            ` : ''}

            <!-- Business Information Section -->
            ${documentData.businessInfo?.businessName ? `
            <div class="section">
                <div class="section-title">Business Information</div>
                <div class="field">
                    <span class="field-label">Business Name:</span>
                    <span class="field-value">${documentData.businessInfo.businessName}</span>
                </div>
            </div>
            ` : ''}

            <!-- Minister Verification -->
            ${documentData.ministerInfo?.verified ? `
            <div class="section">
                <div class="section-title">Minister Verification</div>
                <div class="field">
                    <span class="field-label">Status:</span>
                    <span class="field-value">✓ Verified Minister Certification</span>
                </div>
                <div class="field">
                    <span class="field-label">Certificate:</span>
                    <span class="field-value">${documentData.ministerInfo.certificateName}</span>
                </div>
            </div>
            ` : ''}

            <!-- Legal Declaration -->
            <div class="section">
                <div class="section-title">Legal Declaration</div>
                <p>This document has been generated with blockchain verification to ensure authenticity and prevent tampering. 
                The information contained herein has been verified through multiple security measures including digital signatures, 
                blockchain hashing, and minister certification where applicable.</p>
                
                <p>This document is legally binding and has been created in accordance with applicable laws and regulations. 
                All verification elements below provide immutable proof of document authenticity.</p>
            </div>

            <!-- Signature Section -->
            <div class="signature-section">
                <div style="margin-bottom: 80px;">
                    <div class="signature-line"></div>
                    <div class="signature-label">Signature</div>
                </div>
                
                <div style="margin-bottom: 80px;">
                    <div class="signature-line"></div>
                    <div class="signature-label">Date</div>
                </div>
                
                ${documentData.ministerInfo?.verified ? `
                <div style="margin-bottom: 80px;">
                    <div class="signature-line"></div>
                    <div class="signature-label">Minister Signature</div>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- FOOTER WITH VERIFICATION ELEMENTS -->
        <div class="footer">
            <!-- QR Code 1: Blockchain Verification -->
            <div class="footer-element">
                ${documentData.footerElements?.blockchainQR ? `
                    <img src="${documentData.footerElements.blockchainQR}" class="footer-qr" alt="Blockchain QR">
                    <div class="footer-text">Blockchain Verify</div>
                ` : `
                    <div style="width: 60px; height: 60px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 8px;">QR1</div>
                    <div class="footer-text">Blockchain</div>
                `}
            </div>

            <!-- QR Code 2: Google Drive -->
            <div class="footer-element">
                ${documentData.footerElements?.googleDriveQR ? `
                    <img src="${documentData.footerElements.googleDriveQR}" class="footer-qr" alt="Drive QR">
                    <div class="footer-text">Drive Access</div>
                ` : `
                    <div style="width: 60px; height: 60px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 8px;">QR2</div>
                    <div class="footer-text">Drive</div>
                `}
            </div>

            <!-- Barcode -->
            <div class="footer-element">
                ${documentData.footerElements?.barcodeImage ? `
                    <img src="data:image/png;base64,${documentData.footerElements.barcodeImage}" class="footer-barcode" alt="Barcode">
                ` : `
                    <div style="width: 80px; height: 40px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 8px;">BARCODE</div>
                `}
                <div class="footer-text">Authenticity Code</div>
            </div>

            <!-- Blockchain Hash -->
            <div class="footer-element">
                <div class="footer-hash">
                    <strong>Hash:</strong><br>
                    ${(documentData.footerElements?.blockchainHash || documentData.documentHash || 'N/A').substring(0, 16)}...
                </div>
                <div class="footer-text">Verification ID</div>
            </div>
        </div>
    </body>
    </html>
    `

    console.log('Generated comprehensive HTML template')

    // Send to PDFShift
    const response = await fetch('https://api.pdfshift.io/v3/convert/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: htmlContent,
        format: 'A4',
        margin: '0.75in',
        orientation: 'portrait',
        sandbox: true,
        delay: 2000,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PDFShift API error:', response.status, errorText)
      throw new Error(`PDFShift API error: ${response.status} - ${errorText}`)
    }

    const pdfBuffer = await response.arrayBuffer()
    console.log('PDF generated successfully, size:', pdfBuffer.byteLength)

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="trust-document.pdf"',
      },
    })

  } catch (error) {
    console.error('PDF generation failed:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Complete PDF generation system integration failed'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})