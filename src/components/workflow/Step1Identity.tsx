import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Shield, Check } from 'lucide-react';

interface Step1IdentityProps {
  onNext: (data: any) => void;
  data: any;
  updateStepData?: (stepKey: string, data: any) => void;
  currentStepKey?: string;
}

const Step1Identity = ({ onNext, data, updateStepData, currentStepKey }: Step1IdentityProps) => {
  // Load existing data for this specific step
  const existingStepData = currentStepKey ? data[currentStepKey] : {};
  const [showSaved, setShowSaved] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: existingStepData?.fullName || data?.fullName || '',
    dateOfBirth: existingStepData?.dateOfBirth || data?.dateOfBirth || '',
    address: existingStepData?.address || data?.address || '',
    city: existingStepData?.city || data?.city || '',
    state: existingStepData?.state || data?.state || '',
    zipCode: existingStepData?.zipCode || data?.zipCode || '',
    ...existingStepData
  });

  const [uploadedDoc, setUploadedDoc] = useState<File | null>(existingStepData?.identityDocument || null);

  // Auto-save form data when it changes
  useEffect(() => {
    if (updateStepData && currentStepKey) {
      const dataToSave = { ...formData, identityDocument: uploadedDoc };
      updateStepData(currentStepKey, dataToSave);
      
      // Show saved indicator
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, uploadedDoc, updateStepData, currentStepKey]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDoc(file);
    }
  };

  const handleNext = () => {
    onNext({ ...formData, identityDocument: uploadedDoc });
  };

  const isFormValid = formData.fullName && formData.dateOfBirth && formData.address && formData.city && formData.state && formData.zipCode;

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      {showSaved && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="h-4 w-4" />
          <span className="text-sm">Progress saved</span>
        </div>
      )}
      
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
        <p className="text-muted-foreground">
          Secure identity verification with automated OCR processing and NDA generation
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          💾 Your progress is automatically saved as you type
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Enter your personal details for document creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Legal Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full legal name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Address Information
            </CardTitle>
            <CardDescription>
              Your primary residential address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="12345"
                required
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Identity Document Upload
          </CardTitle>
          <CardDescription>
            Upload a government-issued ID for verification (optional but recommended)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              id="identity-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="identity-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm">
                <span className="font-medium text-primary">Click to upload</span>
                <span className="text-muted-foreground"> or drag and drop</span>
              </div>
              <p className="text-xs text-muted-foreground">
                PDF, PNG, JPG up to 10MB
              </p>
            </label>
            {uploadedDoc && (
              <p className="text-sm text-primary mt-2">
                ✓ {uploadedDoc.name} uploaded
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} disabled={!isFormValid} size="lg">
          Continue to Trust Configuration
        </Button>
      </div>
    </div>
  );
};

export default Step1Identity;