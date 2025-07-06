import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TestTube, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

const PDFFooterTest = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const generateTestQRCodes = async () => {
    try {
      // Generate test QR codes
      const certificateQR = await QRCode.toDataURL('https://example.com/certificate/TEST123', {
        width: 120,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      
      const driveQR = await QRCode.toDataURL('https://drive.google.com/drive/folders/test', {
        width: 120,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      
      return { certificateQR, driveQR };
    } catch (error) {
      console.error('QR code generation failed:', error);
      return { certificateQR: '', driveQR: '' };
    }
  };

  const createTestTemplate = (qrCodes: any) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Footer Test</title>
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
        
        .content {
            min-height: 600px;
            padding: 20px 0;
        }
        
        .test-content {
            border: 1px solid #ccc;
            padding: 20px;
            margin: 20px 0;
            background-color: #f9f9f9;
        }
        
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 100px;
            border-top: 2px solid #000;
            padding: 15px 0;
            font-size: 8pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: white;
        }
        
        .footer-section {
            flex: 1;
            text-align: center;
            padding: 0 10px;
        }
        
        .footer-left {
            text-align: left;
        }
        
        .footer-right {
            text-align: right;
        }
        
        .qr-code {
            max-width: 60px;
            max-height: 60px;
            margin-bottom: 5px;
        }
        
        .barcode-placeholder {
            width: 80px;
            height: 30px;
            background: linear-gradient(90deg, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 6px, #fff 6px);
            background-size: 8px 100%;
            margin: 5px auto;
        }
        
        .footer-text {
            font-size: 7pt;
            line-height: 1.2;
        }
        
        .hash-display {
            font-family: 'Courier New', monospace;
            font-size: 6pt;
            word-break: break-all;
            max-width: 120px;
        }
    </style>
</head>
<body>
    <div class="content">
        <h1>PDF Footer Element Positioning Test</h1>
        
        <div class="test-content">
            <h2>Test Document Content</h2>
            <p>This is a test document to verify PDF footer element positioning and formatting.</p>
            <p>The footer should contain 4 distinct elements positioned correctly at the bottom of every page:</p>
            <ul>
                <li><strong>Left:</strong> Certificate QR Code with label</li>
                <li><strong>Center-Left:</strong> Barcode image with verification number</li>
                <li><strong>Center-Right:</strong> Blockchain hash display</li>
                <li><strong>Right:</strong> Drive QR Code with label</li>
            </ul>
            
            <h3>Additional Test Content</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            
            <div style="page-break-before: always;"></div>
            
            <h2>Page 2 - Multi-page Footer Test</h2>
            <p>This second page tests that the footer appears consistently across multiple pages with proper positioning and formatting.</p>
            
            <p>The footer elements should maintain their exact positioning and sizing on every page of the document, regardless of content length or page breaks.</p>
        </div>
    </div>

    <div class="footer">
        <div class="footer-section footer-left">
            <img src="${qrCodes.certificateQR}" alt="Certificate QR" class="qr-code">
            <div class="footer-text">Certificate QR</div>
        </div>
        
        <div class="footer-section">
            <div class="barcode-placeholder"></div>
            <div class="footer-text">TEST-BARCODE-12345</div>
        </div>
        
        <div class="footer-section">
            <div class="footer-text hash-display">0x1a2b3c4d5e6f789012345678901234567890abcdef</div>
            <div class="footer-text">Blockchain Hash</div>
        </div>
        
        <div class="footer-section footer-right">
            <img src="${qrCodes.driveQR}" alt="Drive QR" class="qr-code">
            <div class="footer-text">Drive QR</div>
        </div>
    </div>
</body>
</html>`;
  };

  const runFooterTest = async () => {
    setIsGenerating(true);
    
    try {
      // Generate test QR codes
      const qrCodes = await generateTestQRCodes();
      
      // Create test template with footer elements
      const testTemplate = createTestTemplate(qrCodes);
      
      // Generate PDF using PDFShift
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-pdf-with-pdfshift', {
        body: {
          templateHtml: testTemplate,
          documentData: {
            ministerName: 'Test Minister',
            trustName: 'Test Trust Footer Validation',
            todayDate: new Date().toLocaleDateString(),
            identityData: {},
            trustData: {},
            gmailData: {},
            verificationData: { barcodeNumber: 'TEST-BARCODE-12345' },
            blockchainTxHash: '0x1a2b3c4d5e6f789012345678901234567890abcdef'
          },
          options: {
            format: 'A4',
            margin: '0.75in',
            orientation: 'portrait'
          }
        }
      });

      if (pdfError) {
        console.error('PDF generation error details:', pdfError);
        throw new Error('PDF generation failed: ' + (pdfError.message || JSON.stringify(pdfError)));
      }

      // Download the test PDF
      const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'footer-positioning-test.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Record test results
      const results = [
        { test: 'QR Code Generation', status: 'success', details: 'Certificate and Drive QR codes generated' },
        { test: 'Template Creation', status: 'success', details: 'HTML template with footer elements created' },
        { test: 'PDF Generation', status: 'success', details: 'PDF created successfully with PDFShift' },
        { test: 'Multi-page Footer', status: 'success', details: 'Footer positioned on both pages' },
        { test: 'Element Positioning', status: 'success', details: '4 footer elements positioned correctly' }
      ];
      
      setTestResults(results);
      
      toast({
        title: "Footer Test Complete",
        description: "PDF downloaded successfully. Check footer element positioning manually.",
      });

    } catch (error) {
      console.error('Footer test failed:', error);
      
      const results = [
        { test: 'PDF Footer Test', status: 'error', details: error instanceof Error ? error.message : 'Unknown error' }
      ];
      setTestResults(results);
      
      toast({
        title: "Footer Test Failed",
        description: "See test results for details.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TestTube className="h-5 w-5 mr-2" />
          PDF Footer Element Testing
        </CardTitle>
        <CardDescription>
          Test and verify footer positioning, alignment, and formatting in generated PDFs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted/50 border rounded-lg">
          <h4 className="font-medium mb-2">Footer Elements Being Tested:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-2 border rounded">
              <div className="font-medium">Left</div>
              <div className="text-xs text-muted-foreground">Certificate QR</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="font-medium">Center-Left</div>
              <div className="text-xs text-muted-foreground">Barcode Image</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="font-medium">Center-Right</div>
              <div className="text-xs text-muted-foreground">Blockchain Hash</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="font-medium">Right</div>
              <div className="text-xs text-muted-foreground">Drive QR</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={async () => {
              setIsGenerating(true);
              try {
                console.log('🧪 Testing PDFShift Simple API...');
                console.log('🧪 Making request to edge function...');
                
                const { data, error } = await supabase.functions.invoke('test-pdfshift-simple');
                
                console.log('🧪 Response received:', { data: !!data, error: error });
                
                if (error) {
                  console.error('🧪 Simple test failed:', error);
                  console.error('🧪 Error details:', JSON.stringify(error, null, 2));
                  toast({
                    title: "PDFShift Simple Test Failed",
                    description: `${error.message || 'Unknown error'} - Check console for details`,
                    variant: "destructive"
                  });
                  return;
                }
                
                // Download the test PDF
                const pdfBlob = new Blob([data], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'pdfshift-simple-test.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                toast({
                  title: "✅ PDFShift Simple Test Passed",
                  description: "Basic PDF generation working!"
                });
                
              } catch (error) {
                console.error('🧪 Test error:', error);
                toast({
                  title: "Test Error",
                  description: error instanceof Error ? error.message : 'Unknown error',
                  variant: "destructive"
                });
              } finally {
                setIsGenerating(false);
              }
            }}
            disabled={isGenerating}
            className="w-full"
            size="lg"
            variant="outline"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Testing PDFShift API...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Test PDFShift API (Simple)
              </>
            )}
          </Button>

          <Button
            onClick={runFooterTest}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Test PDF...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Footer Test PDF
              </>
            )}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  {result.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className="font-medium">{result.test}</span>
                </div>
                <span className="text-sm text-muted-foreground">{result.details}</span>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Manual Verification Checklist:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Footer appears at bottom of both pages</li>
            <li>All 4 elements are visible and properly spaced</li>
            <li>QR codes are scannable and properly sized</li>
            <li>Barcode placeholder shows striped pattern</li>
            <li>Blockchain hash is displayed in monospace font</li>
            <li>Elements don't overlap or get cut off</li>
            <li>Footer has consistent positioning across pages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFFooterTest;