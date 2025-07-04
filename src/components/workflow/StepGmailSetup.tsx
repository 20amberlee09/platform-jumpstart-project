import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, FolderOpen, ExternalLink, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StepGmailSetupProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepGmailSetup = ({ onNext, onPrev, data }: StepGmailSetupProps) => {
  const [gmailAccount, setGmailAccount] = useState(data?.gmailAccount || '');
  const [googleDriveFolder, setGoogleDriveFolder] = useState(data?.googleDriveFolder || '');
  const [isGmailCreated, setIsGmailCreated] = useState(data?.isGmailCreated || false);
  const [isDriveFolderCreated, setIsDriveFolderCreated] = useState(data?.isDriveFolderCreated || false);
  
  const { toast } = useToast();

  const generateSuggestedEmail = () => {
    const trustName = data?.trustBaseName || 'Trust';
    const cleanName = trustName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanName}ecclesiastictrust@gmail.com`;
  };

  const handleGmailCreated = () => {
    if (!gmailAccount.includes('@gmail.com')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid Gmail address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGmailCreated(true);
    toast({
      title: "Gmail Account Confirmed",
      description: "Your trust Gmail account has been confirmed.",
    });
  };

  const handleDriveFolderCreated = () => {
    if (!googleDriveFolder.trim()) {
      toast({
        title: "Folder Name Required",
        description: "Please enter the Google Drive folder name.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDriveFolderCreated(true);
    toast({
      title: "Drive Folder Confirmed",
      description: "Your Google Drive folder has been confirmed.",
    });
  };

  const handleNext = () => {
    if (!isGmailCreated || !isDriveFolderCreated) {
      toast({
        title: "Setup Required",
        description: "Please complete both Gmail and Google Drive setup before continuing.",
        variant: "destructive"
      });
      return;
    }
    
    onNext({ 
      gmailAccount,
      googleDriveFolder,
      isGmailCreated: true,
      isDriveFolderCreated: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Gmail & Drive Setup</h2>
        <p className="text-muted-foreground">
          Create Gmail account and Google Drive folder for your trust
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Gmail Account Creation
          </CardTitle>
          <CardDescription>
            Create a Gmail account that reflects your trust name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold mb-2">Suggested Email Address</h3>
            <p className="text-sm font-mono bg-muted p-2 rounded">
              {generateSuggestedEmail()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Use this format or create your own variation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gmailAccount">Gmail Account</Label>
            <Input
              id="gmailAccount"
              value={gmailAccount}
              onChange={(e) => setGmailAccount(e.target.value)}
              placeholder={generateSuggestedEmail()}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('https://accounts.google.com/signup', '_blank')}
              className="flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Create Gmail Account
            </Button>
            <Button
              onClick={handleGmailCreated}
              disabled={isGmailCreated || !gmailAccount}
              variant="neon-blue"
            >
              {isGmailCreated ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="h-5 w-5 mr-2" />
            Google Drive Folder
          </CardTitle>
          <CardDescription>
            Create a dedicated Google Drive folder for your trust documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold mb-2">Folder Organization</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Create a main folder for your trust with the following structure:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{data?.fullTrustName || 'Trust Name'}</li>
              <li className="ml-4">Documents</li>
              <li className="ml-4">Certificates</li>
              <li className="ml-4">Verification</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleDriveFolder">Main Folder Name</Label>
            <Input
              id="googleDriveFolder"
              value={googleDriveFolder}
              onChange={(e) => setGoogleDriveFolder(e.target.value)}
              placeholder={data?.fullTrustName || 'Your Trust Name Ecclesiastic Revocable Living Trust'}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('https://drive.google.com', '_blank')}
              className="flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Google Drive
            </Button>
            <Button
              onClick={handleDriveFolderCreated}
              disabled={isDriveFolderCreated || !googleDriveFolder}
              variant="neon-cyan"
            >
              {isDriveFolderCreated ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGmailCreated && isDriveFolderCreated && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="font-medium text-green-800">Setup Complete!</p>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your Gmail account and Google Drive folder are ready for document management.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          Back to Ordination
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isGmailCreated || !isDriveFolderCreated} 
          size="lg"
          variant="neon-green"
        >
          Continue to Verification Tools
        </Button>
      </div>
    </div>
  );
};

export default StepGmailSetup;