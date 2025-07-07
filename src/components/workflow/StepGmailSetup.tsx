import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, FolderOpen, ExternalLink, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StepGmailSetupProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepGmailSetup = ({ onNext, onPrev, data }: StepGmailSetupProps) => {
  const { toast } = useToast();
  
  const [gmailAccount, setGmailAccount] = useState(data?.gmailAccount || '');
  const [googleDriveFolder, setGoogleDriveFolder] = useState(data?.googleDriveFolder || '');
  const [isGmailCreated, setIsGmailCreated] = useState(data?.isGmailCreated || false);
  const [isDriveFolderCreated, setIsDriveFolderCreated] = useState(data?.isDriveFolderCreated || false);

  const generateSuggestedEmail = () => {
    const trustName = data?.['step-trust-name']?.trustBaseName || data?.trustBaseName || 'smithfamily';
    const cleanName = trustName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanName}erltrust@gmail.com`;
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
    console.log('Gmail setup continue clicked:', { isGmailCreated, isDriveFolderCreated });
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
      isDriveFolderCreated: true,
      completedAt: new Date().toISOString()
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
            <h3 className="font-semibold mb-2">Step-by-Step Gmail Creation</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Click "Create Gmail Account" button below</li>
              <li>Choose "Personal" account type when prompted</li>
              <li>Fill in your first name and last name</li>
              <li>Create a username using our suggested format: <span className="font-mono bg-muted px-1 rounded">{generateSuggestedEmail().split('@')[0]}</span></li>
              <li>Create a strong password (write it down safely!)</li>
              <li>Add your phone number for verification</li>
              <li>Complete the verification process</li>
              <li>Enter the Gmail address you created below and click "Confirm"</li>
            </ol>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-1">Suggested Email Format:</h4>
            <p className="text-sm font-mono bg-white p-2 rounded border">
              {generateSuggestedEmail()}
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
            <h3 className="font-semibold mb-2">Step-by-Step Google Drive Setup</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Click "Open Google Drive" button below</li>
              <li>Sign in with the Gmail account you just created</li>
              <li>Once in Google Drive, click the "+ New" button (top left)</li>
              <li>Select "Folder" from the dropdown menu</li>
              <li>Name your folder: <span className="font-mono bg-muted px-1 rounded">{data?.fullTrustName || 'Your Trust Name'}</span></li>
              <li>Press Enter to create the folder</li>
              <li>Double-click to open your new folder</li>
              <li>Create 3 sub-folders inside: "Documents", "Certificates", "Verification"</li>
              <li>Enter your main folder name below and click "Confirm"</li>
            </ol>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-1">Your Main Folder Structure:</h4>
            <div className="text-sm font-mono bg-white p-2 rounded border space-y-1">
              <div>📁 {data?.fullTrustName || 'Your Trust Name'}</div>
              <div className="ml-4">📁 Documents</div>
              <div className="ml-4">📁 Certificates</div>
              <div className="ml-4">📁 Verification</div>
            </div>
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

      {/* Clear status indicators */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-3 rounded-lg border-2 ${isGmailCreated ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
          <div className="flex items-center">
            {isGmailCreated ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-yellow-500 mr-2"></div>
            )}
            <span className={`font-medium ${isGmailCreated ? 'text-green-700' : 'text-yellow-700'}`}>
              Gmail Account
            </span>
          </div>
          <p className={`text-sm mt-1 ${isGmailCreated ? 'text-green-600' : 'text-yellow-600'}`}>
            {isGmailCreated ? 'Confirmed ✓' : 'Click "Confirm" button above'}
          </p>
        </div>
        
        <div className={`p-3 rounded-lg border-2 ${isDriveFolderCreated ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
          <div className="flex items-center">
            {isDriveFolderCreated ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-yellow-500 mr-2"></div>
            )}
            <span className={`font-medium ${isDriveFolderCreated ? 'text-green-700' : 'text-yellow-700'}`}>
              Drive Folder
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDriveFolderCreated ? 'text-green-600' : 'text-yellow-600'}`}>
            {isDriveFolderCreated ? 'Confirmed ✓' : 'Click "Confirm" button above'}
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg" disabled={!onPrev}>
          Back to Ordination
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isGmailCreated || !isDriveFolderCreated} 
          size="lg"
          className={isGmailCreated && isDriveFolderCreated ? "bg-green-600 hover:bg-green-700" : "opacity-50 cursor-not-allowed"}
        >
          {isGmailCreated && isDriveFolderCreated ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Continue to Verification Tools
            </>
          ) : (
            "Complete Both Steps Above First"
          )}
        </Button>
      </div>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
          <div>Debug: gmailCreated={isGmailCreated.toString()}, driveCreated={isDriveFolderCreated.toString()}</div>
          <div>onPrev available: {!!onPrev}</div>
        </div>
      )}
    </div>
  );
};

export default StepGmailSetup;