import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Edge Function: test-pdfshift-simple called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🚀 Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 PDFShift Simple Test: Starting (v3)');
    
    const pdfShiftApiKey = Deno.env.get('PDFSHIFT_API_KEY');
    console.log('🧪 API Key present:', !!pdfShiftApiKey);
    console.log('🧪 API Key length:', pdfShiftApiKey?.length || 0);
    
    if (!pdfShiftApiKey) {
      console.error('❌ PDFShift API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'PDFShift API key not configured',
          message: 'PDFSHIFT_API_KEY environment variable is missing'
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
    <p>Function version: v3</p>
</body>
</html>`;

    const pdfOptions = {
      source: simpleHtml,
      format: 'A4',
      margin: '0.5in',
      orientation: 'portrait'
    };

    console.log('🧪 PDFShift: Making API request');
    console.log('🧪 HTML length:', simpleHtml.length);
    
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
    console.log('🧪 PDFShift response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🧪 PDFShift API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'PDFShift API error',
          status: response.status,
          details: errorText,
          apiKeyPresent: !!pdfShiftApiKey,
          apiKeyLength: pdfShiftApiKey?.length || 0
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
    console.error('🧪 Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Test failed', 
        details: error.message,
        stack: error.stack,
        name: error.name
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});