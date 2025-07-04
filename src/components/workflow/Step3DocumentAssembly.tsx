import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Step3DocumentAssemblyProps {
  onNext: () => void;
  onPrev: () => void;
  data: any;
}

const Step3DocumentAssembly = ({ onNext, onPrev, data }: Step3DocumentAssemblyProps) => {
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [isAssembling, setIsAssembling] = useState(false);
  const [documentsGenerated, setDocumentsGenerated] = useState(false);

  const handleStartAssembly = async () => {
    setIsAssembling(true);
    setAssemblyProgress(0);

    // Simulate document assembly process
    const intervals = [
      { progress: 20, message: "Analyzing trust configuration..." },
      { progress: 40, message: "Generating trust document..." },
      { progress: 60, message: "Applying custom clauses..." },
      { progress: 80, message: "Formatting legal documents..." },
      { progress: 100, message: "Documents ready for review!" }
    ];

    for (const interval of intervals) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAssemblyProgress(interval.progress);
    }

    setIsAssembling(false);
    setDocumentsGenerated(true);
  };

  const documents = [
    {
      name: "Irrevocable Living Trust Agreement",
      type: "Primary Document",
      pages: 12,
      status: documentsGenerated ? "ready" : "pending"
    },
    {
      name: "Trust Funding Instructions",
      type: "Supporting Document", 
      pages: 3,
      status: documentsGenerated ? "ready" : "pending"
    },
    {
      name: "Asset Transfer Guidelines",
      type: "Supporting Document",
      pages: 2,
      status: documentsGenerated ? "ready" : "pending"
    },
    {
      name: "Trust Administration Guide",
      type: "Reference Document",
      pages: 8,
      status: documentsGenerated ? "ready" : "pending"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Document Assembly</h2>
        <p className="text-muted-foreground">
          Generate your custom trust documents based on your configuration
        </p>
      </div>

      {!documentsGenerated && !isAssembling && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle>Ready to Generate Documents</CardTitle>
              <CardDescription>
                We'll create your custom irrevocable living trust documents using the information you provided
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Trust Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trust Name:</span>
                      <span>{data?.trustName || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>Irrevocable Living Trust</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trustee:</span>
                      <span>{data?.trusteeType || 'Individual'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{data?.fullName || 'From ID Verification'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">State:</span>
                      <span>{data?.state || 'From Address'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Documents:</span>
                      <span>4 files</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span>Document generation typically takes 30-60 seconds</span>
                </div>
                <Button 
                  onClick={handleStartAssembly}
                  className="w-full"
                  size="lg"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Trust Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isAssembling && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Generating Documents...
              </CardTitle>
              <CardDescription>
                Please wait while we create your custom trust documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Assembly Progress</span>
                  <span>{assemblyProgress}%</span>
                </div>
                <Progress value={assemblyProgress} className="w-full" />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                This may take a few moments...
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {documentsGenerated && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Documents Generated Successfully!</h3>
            <p className="text-muted-foreground">
              Your custom trust documents are ready for review and download
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {documents.map((doc, index) => (
              <Card key={index} className="border-2 border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{doc.name}</CardTitle>
                      <CardDescription>{doc.type} • {doc.pages} pages</CardDescription>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                      Ready
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Next Steps</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Please review all documents carefully before proceeding to digital signatures. 
                  Once signed, these documents will be legally binding.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button onClick={onPrev} variant="outline" size="lg">
              Back to Trust Config
            </Button>
            <Button onClick={onNext} size="lg">
              Continue to Signatures
            </Button>
          </div>
        </div>
      )}

      {!documentsGenerated && !isAssembling && (
        <div className="flex justify-between pt-6 max-w-2xl mx-auto">
          <Button onClick={onPrev} variant="outline" size="lg">
            Back to Trust Config
          </Button>
        </div>
      )}
    </div>
  );
};

export default Step3DocumentAssembly;