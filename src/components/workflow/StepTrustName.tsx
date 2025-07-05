import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface StepTrustNameProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepTrustName = ({ onNext, onPrev, data }: StepTrustNameProps) => {
  const [formData, setFormData] = useState({
    trustBaseName: data?.trustBaseName || '',
    fullTrustName: data?.fullTrustName || '',
    trustType: data?.trustType || 'ecclesiastic-revocable-living'
  });

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Trust Name Selection</h2>
        <p className="text-muted-foreground">
          Choose a unique name for your trust
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trust Base Name</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trustBaseName">Trust Base Name</Label>
            <Input
              id="trustBaseName"
              value={formData.trustBaseName}
              onChange={(e) => setFormData({...formData, trustBaseName: e.target.value})}
              placeholder="Enter your trust base name"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          Back to Identity
        </Button>
        <Button onClick={handleNext} size="lg">
          Continue to Ordination
        </Button>
      </div>
    </div>
  );
};

export default StepTrustName;