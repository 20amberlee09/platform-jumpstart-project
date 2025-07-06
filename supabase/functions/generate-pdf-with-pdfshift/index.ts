import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PDFGenerationRequest {
  templateHtml: string;
  documentData: {
    ministerName: string;
    trustName: string;
    todayDate: string;
    identityData: any;
    trustData: any;
    gmailData: any;
    verificationData: any;
    blockchainTxHash?: string;
  };
  options?: {
    format?: 'A4' | 'Letter';
    margin?: string;
    orientation?: 'portrait' | 'landscape';
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pdfShiftApiKey = Deno.env.get('PDFSHIFT_API_KEY');
    if (!pdfShiftApiKey) {
      throw new Error('PDFShift API key not configured');
    }

    const { templateHtml, documentData, options = {} }: PDFGenerationRequest = await req.json();

    console.log('PDFShift Edge Function: Starting PDF generation');
    console.log('Document data:', { 
      ministerName: documentData.ministerName, 
      trustName: documentData.trustName 
    });

    // Process HTML template with data injection
    const processedHtml = processTemplate(templateHtml, documentData);
    
    // Default PDF options
    const pdfOptions = {
      source: processedHtml,
      format: options.format || 'A4',
      margin: options.margin || '0.5in',
      orientation: options.orientation || 'portrait',
      sandbox: true,
      delay: 1000, // Wait for CSS/images to load
    };

    console.log('PDFShift: Sending request to API');
    
    // Make request to PDFShift API
    const response = await fetch('https://api.pdfshift.io/v3/convert/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(pdfShiftApiKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfOptions)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PDFShift API error:', response.status, errorText);
      throw new Error(`PDFShift API error: ${response.status} - ${errorText}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    console.log('PDFShift: PDF generated successfully, size:', pdfBuffer.byteLength);

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
      },
    });

  } catch (error) {
    console.error('PDF generation failed:', error);
    return new Response(
      JSON.stringify({ 
        error: 'PDF generation failed', 
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Process HTML template by injecting user data
 */
function processTemplate(templateHtml: string, data: any): string {
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
  };

  // Apply all replacements
  Object.entries(replacements).forEach(([placeholder, value]) => {
    processedHtml = processedHtml.replace(new RegExp(placeholder, 'g'), value);
  });

  return processedHtml;
}