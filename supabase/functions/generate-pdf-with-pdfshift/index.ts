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
  console.log('🚀 PDFShift Edge Function: Starting v4');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🚀 Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 PDFShift Edge Function: Request received');
    
    const pdfShiftApiKey = Deno.env.get('PDFSHIFT_API_KEY');
    console.log('🔑 API Key present:', !!pdfShiftApiKey);
    console.log('🔑 API Key length:', pdfShiftApiKey?.length || 0);
    
    if (!pdfShiftApiKey) {
      console.error('❌ PDFShift API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'PDFShift API key not configured',
          details: 'PDFSHIFT_API_KEY environment variable is missing',
          apiKeyPresent: false,
          functionVersion: 'v4'
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log first few characters of API key for debugging (safely)
    console.log('🔑 API Key first 10 chars:', pdfShiftApiKey.substring(0, 10));
    console.log('🔑 API Key starts with sk_:', pdfShiftApiKey.startsWith('sk_'));

    const requestBody = await req.json();
    console.log('📥 Request received with keys:', Object.keys(requestBody));
    
    const { templateHtml, documentData, options = {} } = requestBody;

    console.log('📄 Document data:', { 
      ministerName: documentData?.ministerName, 
      trustName: documentData?.trustName,
      templateLength: templateHtml?.length 
    });

    // Process HTML template with data injection
    const processedHtml = processTemplate(templateHtml, documentData);
    console.log('✨ Template processed, final length:', processedHtml.length);
    
    // Default PDF options
    const pdfOptions = {
      source: processedHtml,
      format: options.format || 'A4',
      margin: options.margin || '0.75in',
      orientation: options.orientation || 'portrait',
      sandbox: true,
      delay: 1000, // Wait for CSS/images to load
    };

    console.log('🚀 PDFShift: Sending request to API with options:', {
      format: pdfOptions.format,
      margin: pdfOptions.margin,
      orientation: pdfOptions.orientation,
      htmlLength: pdfOptions.source.length
    });
    
    // Make request to PDFShift API
    const response = await fetch('https://api.pdfshift.io/v3/convert/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(pdfShiftApiKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfOptions)
    });

    console.log('📡 PDFShift response status:', response.status);
    console.log('📡 PDFShift response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ PDFShift API error:', response.status, errorText);
      
      // Try to parse error details
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = errorText;
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'PDFShift API error',
          status: response.status,
          details: errorDetails,
          message: `PDFShift returned ${response.status}: ${errorText}`
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const pdfBuffer = await response.arrayBuffer();
    console.log('✅ PDFShift: PDF generated successfully, size:', pdfBuffer.byteLength);

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
      },
    });

  } catch (error) {
    console.error('💥 PDF generation failed:', error);
    console.error('💥 Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'PDF generation failed', 
        details: error.message,
        stack: error.stack
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