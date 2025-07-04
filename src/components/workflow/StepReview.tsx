import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, FileText, Award } from 'lucide-react';

interface StepReviewProps {
  onNext: () => void;
  onPrev?: () => void;
  data: any;
}

const StepReview = ({ onNext, onPrev, data }: StepReviewProps) => {
  const handleCompleteWorkflow = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Final Review & Completion</h2>
        <p className="text-muted-foreground">
          Review your completed trust documents and finalize the process
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Trust Creation Complete!</CardTitle>
            <CardDescription>
              Your irrevocable living trust has been successfully created and notarized
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-semibold text-green-800">Documents</h4>
                <p className="text-sm text-green-700">4 files ready</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-semibold text-green-800">Signatures</h4>
                <p className="text-sm text-green-700">All collected</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-semibold text-green-800">Notarized</h4>
                <p className="text-sm text-green-700">Legally binding</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4">Your Trust Package Includes:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Irrevocable Living Trust Agreement (12 pages)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Trust Funding Instructions (3 pages)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Asset Transfer Guidelines (2 pages)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Trust Administration Guide (8 pages)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Custom Trust Seal with QR Code
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Notarization Certificate
                </li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download Complete Package
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
          <p className="text-blue-700 mb-4">
            Your trust documents are now legally binding. Here's what you should do next:
          </p>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Review all documents with your financial advisor</li>
            <li>• Begin transferring assets according to the funding instructions</li>
            <li>• Store documents in a secure location</li>
            <li>• Schedule periodic reviews of your trust structure</li>
          </ul>
        </div>

        <div className="flex justify-between pt-6">
          {onPrev && (
            <Button onClick={onPrev} variant="outline" size="lg">
              Back to Signatures
            </Button>
          )}
          <Button onClick={handleCompleteWorkflow} size="lg">
            Complete Process
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepReview;