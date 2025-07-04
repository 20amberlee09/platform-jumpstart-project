import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Users, FileText } from 'lucide-react';

interface StepBasicConfigProps {
  onNext: (data: any) => void;
  onPrev?: () => void;
  data: any;
}

const StepBasicConfig = ({ onNext, onPrev, data }: StepBasicConfigProps) => {
  const [formData, setFormData] = useState({
    trustName: data?.trustName || '',
    beneficiaries: data?.beneficiaries || '',
    trustPurpose: data?.trustPurpose || '',
    ...data
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  const isFormValid = formData.trustName && formData.beneficiaries && formData.trustPurpose;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Settings className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Basic Trust Configuration</h2>
        <p className="text-muted-foreground">
          Configure the basic details for your trust
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Trust Information
            </CardTitle>
            <CardDescription>
              Provide the basic information for your trust setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trustName">Trust Name</Label>
              <Input
                id="trustName"
                value={formData.trustName}
                onChange={(e) => handleInputChange('trustName', e.target.value)}
                placeholder="e.g., Smith Family Trust"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trustPurpose">Trust Purpose</Label>
              <Textarea
                id="trustPurpose"
                value={formData.trustPurpose}
                onChange={(e) => handleInputChange('trustPurpose', e.target.value)}
                placeholder="Describe the main purpose of this trust..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiaries">Beneficiaries</Label>
              <Textarea
                id="beneficiaries"
                value={formData.beneficiaries}
                onChange={(e) => handleInputChange('beneficiaries', e.target.value)}
                placeholder="List the beneficiaries and their relationship to you..."
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-6">
          {onPrev && (
            <Button onClick={onPrev} variant="outline" size="lg">
              Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={!isFormValid} size="lg">
            Continue to Documents
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepBasicConfig;