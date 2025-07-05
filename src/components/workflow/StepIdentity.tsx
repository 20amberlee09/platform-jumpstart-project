import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Shield } from 'lucide-react';
import DocumentUpload from './DocumentUpload';

interface StepIdentityProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepIdentity = ({ onNext, onPrev, data }: StepIdentityProps) => {
  const [formData, setFormData] = useState({
    fullName: data?.fullName || '',
    dateOfBirth: data?.dateOfBirth || '',
    address: data?.address || '',
    city: data?.city || '',
    state: data?.state || '',
    zipCode: data?.zipCode || '',
    ...data
  });

  const [uploadedFiles, setUploadedFiles] = useState(data?.uploadedFiles || []);

  const documentRequirements = [
    {
      id: 'government-id',
      name: 'Government-Issued ID',
      description: 'Upload a driver\'s license, passport, or other government-issued identification',
      required: false,
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxSize: 10
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleNext = () => {
    onNext({ ...formData, uploadedFiles });
  };

  const isFormValid = formData.fullName && formData.dateOfBirth && formData.address && formData.city && formData.state && formData.zipCode;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
        <p className="text-muted-foreground">
          Secure identity verification and personal information collection
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
              Enter your personal details for trust creation
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

      <DocumentUpload
        title="Identity Verification Documents"
        requirements={documentRequirements}
        uploadedFiles={uploadedFiles}
        onFilesChange={setUploadedFiles}
      />

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          Back to NDA
        </Button>
        <Button onClick={handleNext} disabled={!isFormValid} size="lg">
          Continue to Trust Name
        </Button>
      </div>
    </div>
  );
};

export default StepIdentity;