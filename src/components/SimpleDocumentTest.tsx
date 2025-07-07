import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocumentDownload } from '@/hooks/useDocumentDownload';
import { useAuth } from '@/hooks/useAuth';

const SimpleDocumentTest = () => {
  const { user } = useAuth();
  const { downloadDocument, isGenerating } = useDocumentDownload();
  const [lastResult, setLastResult] = useState<string>('');

  const testDocumentGeneration = async () => {
    if (!user) {
      setLastResult('❌ Please log in first');
      return;
    }

    try {
      setLastResult('🔄 Generating document...');
      
      const testData = {
        ministerName: user.email?.split('@')[0] || 'Test Minister',
        trustName: 'Emergency Test Trust',
        identityData: {
          fullName: user.email?.split('@')[0] || 'Test User'
        }
      };

      await downloadDocument('Certificate of Trust (Simple)', testData);
      setLastResult('✅ Document generated and downloaded successfully!');
      
    } catch (error) {
      console.error('Test failed:', error);
      setLastResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Simple Document Test
        </CardTitle>
        <CardDescription>
          Test basic PDF document generation and download
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <strong>User:</strong> {user?.email || 'Not logged in'}
          </p>
          <p className="text-sm">
            <strong>Status:</strong> {user ? '✅ Ready' : '❌ Login required'}
          </p>
        </div>

        <Button
          onClick={testDocumentGeneration}
          disabled={isGenerating || !user}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Document...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Test Certificate
            </>
          )}
        </Button>

        {lastResult && (
          <div className="p-3 border rounded-lg">
            <p className="text-sm font-mono">{lastResult}</p>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">What This Tests:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Basic PDF generation API</li>
            <li>Simple HTML template processing</li>
            <li>Document download functionality</li>
            <li>Database record creation</li>
            <li>User authentication flow</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleDocumentTest;