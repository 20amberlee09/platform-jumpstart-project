import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Simple PDF Test Function Called - v2');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📝 Testing basic PDF generation with PDFShift');
    
    const pdfShiftApiKey = Deno.env.get('PDFSHIFT_API_KEY');
    console.log('🔑 API Key present:', !!pdfShiftApiKey);
    
    if (!pdfShiftApiKey) {
      console.error('❌ No API key found in environment');
      return new Response(
        JSON.stringify({ 
          error: 'Missing API key',
          message: 'PDFSHIFT_API_KEY not configured in secrets'
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get HTML content from request body if provided, otherwise use default
    let htmlContent;
    try {
      const requestBody = await req.json();
      htmlContent = requestBody.htmlContent;
    } catch (e) {
      // If no body or invalid JSON, use default HTML
      htmlContent = null;
    }

    const simpleHtml = htmlContent || `<!DOCTYPE html>
<html>
<head>
    <title>PDF Test</title>
    <style>body { font-family: Arial; padding: 20px; }</style>
</head>
<body>
    <h1>PDF Generation Test</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    <p>Function Version: v2</p>
</body>
</html>`;

    const pdfOptions = {
      source: simpleHtml,
      format: 'A4',
      margin: '1in'
    };

    console.log('📡 Calling PDFShift API...');
    const response = await fetch('https://api.pdfshift.io/v3/convert/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(pdfShiftApiKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfOptions)
    });

    console.log('📡 PDFShift response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ PDFShift error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'PDFShift API error',
          status: response.status,
          details: errorText
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const pdfBuffer = await response.arrayBuffer();
    console.log('✅ PDF generated successfully, size:', pdfBuffer.byteLength);

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"',
      },
    });

  } catch (error) {
    console.error('💥 Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Function failed', 
        message: error.message,
        stack: error.stack
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});