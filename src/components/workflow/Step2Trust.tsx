import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Scale, FileText, Users } from 'lucide-react';

interface Step2TrustProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const Step2Trust = ({ onNext, onPrev, data }: Step2TrustProps) => {
  const [formData, setFormData] = useState({
    trustName: data?.trustName || '',
    trustType: data?.trustType || '',
    trustPurpose: data?.trustPurpose || '',
    initialFunding: data?.initialFunding || '',
    trusteeType: data?.trusteeType || '',
    coTrustee: data?.coTrustee || '',
    beneficiaries: data?.beneficiaries || '',
    distribution: data?.distribution || '',
    ...data
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  const isFormValid = formData.trustName && formData.trustType && formData.trustPurpose && formData.beneficiaries;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Scale className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Trust Configuration</h2>
        <p className="text-muted-foreground">
          Configure your trust structure with state-specific legal requirements
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Trust Details
            </CardTitle>
            <CardDescription>
              Basic information about your trust
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
              <Label htmlFor="trustType">Trust Type</Label>
              <Select value={formData.trustType} onValueChange={(value) => handleInputChange('trustType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trust type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revocable">Revocable Living Trust</SelectItem>
                  <SelectItem value="irrevocable">Irrevocable Trust</SelectItem>
                  <SelectItem value="testamentary">Testamentary Trust</SelectItem>
                  <SelectItem value="special-needs">Special Needs Trust</SelectItem>
                  <SelectItem value="charitable">Charitable Trust</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trustPurpose">Trust Purpose</Label>
              <Textarea
                id="trustPurpose"
                value={formData.trustPurpose}
                onChange={(e) => handleInputChange('trustPurpose', e.target.value)}
                placeholder="Describe the purpose and goals of this trust..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialFunding">Initial Funding Amount</Label>
              <Input
                id="initialFunding"
                type="number"
                value={formData.initialFunding}
                onChange={(e) => handleInputChange('initialFunding', e.target.value)}
                placeholder="10000"
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Trust Roles
            </CardTitle>
            <CardDescription>
              Define trustees and beneficiaries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trusteeType">Trustee Structure</Label>
              <Select value={formData.trusteeType} onValueChange={(value) => handleInputChange('trusteeType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trustee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Trustee</SelectItem>
                  <SelectItem value="co-trustees">Co-Trustees</SelectItem>
                  <SelectItem value="successor">Successor Trustee</SelectItem>
                  <SelectItem value="corporate">Corporate Trustee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.trusteeType === 'co-trustees' && (
              <div className="space-y-2">
                <Label htmlFor="coTrustee">Co-Trustee Information</Label>
                <Input
                  id="coTrustee"
                  value={formData.coTrustee}
                  onChange={(e) => handleInputChange('coTrustee', e.target.value)}
                  placeholder="Co-trustee full name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="beneficiaries">Beneficiaries</Label>
              <Textarea
                id="beneficiaries"
                value={formData.beneficiaries}
                onChange={(e) => handleInputChange('beneficiaries', e.target.value)}
                placeholder="List beneficiaries and their relationship to you..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distribution">Distribution Terms</Label>
              <Textarea
                id="distribution"
                value={formData.distribution}
                onChange={(e) => handleInputChange('distribution', e.target.value)}
                placeholder="Describe how and when distributions should be made..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          Back to Identity
        </Button>
        <Button onClick={handleNext} disabled={!isFormValid} size="lg">
          Continue to Documents
        </Button>
      </div>
    </div>
  );
};

export default Step2Trust;