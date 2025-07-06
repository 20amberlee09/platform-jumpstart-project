import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useToast } from '@/hooks/use-toast';

interface StepIdentityProps {
  onNext: () => void;
  onPrev?: () => void;
  courseId: string;
}

interface IdentityData {
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  ministerTitle: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const StepIdentity = ({ onNext, onPrev, courseId }: StepIdentityProps) => {
  const [identityData, setIdentityData] = useState<IdentityData>({
    firstName: '',
    lastName: '',
    fullName: '',
    displayName: '',
    ministerTitle: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [isValid, setIsValid] = useState(false);
  const { user } = useAuth();
  const { saveStepData, getStepData, getMinisterStatus } = useUserProgress(courseId);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved step data
    const stepData = getStepData('identity');
    const ministerStatus = getMinisterStatus();
    
    if (stepData) {
      setIdentityData(stepData);
    } else if (user) {
      // Initialize with user data
      const userData = {
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        fullName: user.user_metadata?.full_name || '',
        displayName: ministerStatus.verified ? 
          `Minister ${user.user_metadata?.full_name || ''}` : 
          user.user_metadata?.full_name || '',
        ministerTitle: ministerStatus.verified ? 
          `Minister ${user.user_metadata?.first_name || ''}` : '',
        email: user.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      };
      setIdentityData(userData);
    }
  }, [getStepData, getMinisterStatus, user]);

  useEffect(() => {
    // Auto-save when data changes
    if (identityData.firstName || identityData.email) {
      saveStepData('identity', identityData);
    }

    // Validate form - enhanced validation
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const valid = required.every(field => {
      const value = identityData[field as keyof IdentityData];
      return value && value.trim() !== '';
    });
    
    console.log('Form validation updated:', { valid, identityData });
    setIsValid(valid);
  }, [identityData, saveStepData]);

  const handleInputChange = (field: keyof IdentityData, value: string) => {
    const updatedData = { ...identityData, [field]: value };
    
    // Auto-generate full name and display name
    if (field === 'firstName' || field === 'lastName') {
      const fullName = `${updatedData.firstName} ${updatedData.lastName}`.trim();
      const ministerStatus = getMinisterStatus();
      
      updatedData.fullName = fullName;
      updatedData.displayName = ministerStatus.verified ? 
        `Minister ${fullName}` : fullName;
      updatedData.ministerTitle = ministerStatus.verified ? 
        `Minister ${updatedData.firstName}` : '';
    }
    
    setIdentityData(updatedData);
  };

  const ministerStatus = getMinisterStatus();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
            {ministerStatus.verified && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Minister
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {ministerStatus.verified 
              ? "Complete your information as an ordained minister"
              : "Provide your personal information for document generation"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Minister Status Display */}
          {ministerStatus.verified && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-800">Minister Status Active</div>
                  <div className="text-sm text-blue-600">
                    Your documents will be signed as: {identityData.ministerTitle || 'Minister [First Name]'}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={identityData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={identityData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          {/* Display Names */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium">Generated Names (Auto-filled)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={identityData.fullName} disabled className="bg-background" />
              </div>
              
              {ministerStatus.verified && (
                <div className="space-y-2">
                  <Label>Minister Title</Label>
                  <Input value={identityData.ministerTitle} disabled className="bg-background" />
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={identityData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={identityData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Address Information</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={identityData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={identityData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={identityData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={identityData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="12345"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Validation Status */}
          <div className="text-sm text-muted-foreground">
            * Required fields - {isValid ? 'All fields complete' : 'Please fill all required fields'}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={!onPrev}>
          Previous
        </Button>
        <Button 
          onClick={() => {
            console.log('Form submit clicked, isValid:', isValid);
            if (isValid) {
              onNext();
            }
          }} 
          disabled={!isValid}
          className={isValid ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isValid ? "Continue" : "Complete Required Fields"}
        </Button>
      </div>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
          Debug: isValid={isValid.toString()}, onPrev available: {!!onPrev}
        </div>
      )}
    </div>
  );
};

export default StepIdentity;