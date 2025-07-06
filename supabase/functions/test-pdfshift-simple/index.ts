import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 PDFShift Simple Test: Starting');
    
    const pdfShiftApiKey = Deno.env.get('PDFSHIFT_API_KEY');
    console.log('🧪 API Key present:', !!pdfShiftApiKey);
    
    if (!pdfShiftApiKey) {
      throw new Error('PDFShift API key not configured');
    }

    // Super simple HTML for testing
    const simpleHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PDFShift Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>PDFShift Test Document</h1>
    <p>This is a simple test to verify PDFShift API connection.</p>
    <p>Generated at: ${new Date().toISOString()}</p>
</body>
</html>`;

    const pdfOptions = {
      source: simpleHtml,
      format: 'A4',
      margin: '0.5in',
      orientation: 'portrait'
    };

    console.log('🧪 PDFShift: Making API request');
    console.log('🧪 Request body:', JSON.stringify(pdfOptions));
    
    // Make request to PDFShift API
    const response = await fetch('https://api.pdfshift.io/v3/convert/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(pdfShiftApiKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfOptions)
    });

    console.log('🧪 PDFShift response status:', response.status);
    console.log('🧪 PDFShift response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🧪 PDFShift API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'PDFShift API error',
          status: response.status,
          details: errorText,
          apiKeyPresent: !!pdfShiftApiKey
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const pdfBuffer = await response.arrayBuffer();
    console.log('🧪 PDFShift: PDF generated successfully, size:', pdfBuffer.byteLength);

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="pdfshift-test.pdf"',
      },
    });

  } catch (error) {
    console.error('🧪 Test failed:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Test failed', 
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