import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, CheckCircle, ExternalLink, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { stateSearchUrls } from '@/utils/stateSearchUrls';

interface StepTrustNameProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepTrustName = ({ onNext, onPrev, data }: StepTrustNameProps) => {
  const [trustBaseName, setTrustBaseName] = useState(data?.trustBaseName || '');
  const [fullTrustName, setFullTrustName] = useState('');
  const [usptoSearchCompleted, setUsptoSearchCompleted] = useState(data?.usptoSearchCompleted || false);
  const [stateSearchCompleted, setStateSearchCompleted] = useState(data?.stateSearchCompleted || false);
  
  const { toast } = useToast();
  
  // Get user's state from personal information
  const userState = data?.state || 'CA'; // Default to CA if no state provided
  const stateInfo = stateSearchUrls[userState.toUpperCase()];

  const generateFullTrustName = (baseName: string) => {
    return `${baseName} Ecclesiastic Revocable Living Trust`;
  };

  const handleBaseNameChange = (value: string) => {
    setTrustBaseName(value);
    const fullName = generateFullTrustName(value);
    setFullTrustName(fullName);
    // Reset search completion when name changes
    setUsptoSearchCompleted(false);
    setStateSearchCompleted(false);
  };

  const handleUsptoSearch = () => {
    if (!trustBaseName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a trust name before searching.",
        variant: "destructive"
      });
      return;
    }
    
    // Open USPTO search in new tab
    window.open('https://www.uspto.gov/trademarks/search', '_blank');
  };

  const handleStateSearch = () => {
    if (!trustBaseName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a trust name before searching.",
        variant: "destructive"
      });
      return;
    }
    
    if (stateInfo) {
      window.open(stateInfo.url, '_blank');
    } else {
      toast({
        title: "State Search Unavailable",
        description: "Please search your state's Secretary of State website manually.",
        variant: "destructive"
      });
    }
  };

  const confirmUsptoSearch = () => {
    setUsptoSearchCompleted(true);
    toast({
      title: "USPTO Search Confirmed",
      description: "USPTO trademark search marked as completed.",
    });
  };

  const confirmStateSearch = () => {
    setStateSearchCompleted(true);
    toast({
      title: "State Search Confirmed",
      description: `${stateInfo?.name || 'State'} business entity search marked as completed.`,
    });
  };

  const handleNext = () => {
    if (!usptoSearchCompleted || !stateSearchCompleted) {
      toast({
        title: "Searches Required",
        description: "Please complete both USPTO and state searches before continuing.",
        variant: "destructive"
      });
      return;
    }
    
    onNext({ 
      trustBaseName, 
      fullTrustName,
      nameVerified: true,
      usptoSearchCompleted,
      stateSearchCompleted,
      state: userState
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Search className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Trust Name Selection</h2>
        <p className="text-muted-foreground">
          Choose your trust name and verify its availability
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trust Name Configuration</CardTitle>
          <CardDescription>
            Enter your desired trust name. We'll automatically add "Ecclesiastic Revocable Living Trust" as required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trustBaseName">Trust Base Name</Label>
            <Input
              id="trustBaseName"
              value={trustBaseName}
              onChange={(e) => handleBaseNameChange(e.target.value)}
              placeholder="e.g., Smith Family"
              required
            />
          </div>

          {trustBaseName && (
            <div className="space-y-2">
              <Label>Full Trust Name (Preview)</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium text-primary">{fullTrustName}</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {trustBaseName && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                USPTO Trademark Search
              </CardTitle>
              <CardDescription>
                Search the federal trademark database to ensure no conflicts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-2">Search Instructions:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Click "Search USPTO Database" to open the trademark search</li>
                  <li>Enter your trust name: <span className="font-mono bg-muted px-1 rounded">{trustBaseName}</span></li>
                  <li>Search for any similar or identical trademarks</li>
                  <li>Verify no conflicts exist with your proposed name</li>
                  <li>Return here and confirm your search is complete</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUsptoSearch}
                  disabled={!trustBaseName.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Search USPTO Database
                </Button>
                <Button
                  onClick={confirmUsptoSearch}
                  disabled={!trustBaseName.trim() || usptoSearchCompleted}
                  variant={usptoSearchCompleted ? "default" : "neon-blue"}
                >
                  {usptoSearchCompleted ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    'Confirm Search'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {stateInfo?.name || userState} State Entity Search
              </CardTitle>
              <CardDescription>
                Search your state's business entity database for name conflicts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-2">Search Instructions:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Click "Search {stateInfo?.name || userState} Database" to open your state's search</li>
                  <li>Enter your trust name: <span className="font-mono bg-muted px-1 rounded">{trustBaseName}</span></li>
                  <li>Search for existing business entities with similar names</li>
                  <li>Check for any corporations, LLCs, or trusts with your name</li>
                  <li>Return here and confirm your search is complete</li>
                </ol>
                {stateInfo?.instructions && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    {stateInfo.instructions}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleStateSearch}
                  disabled={!trustBaseName.trim() || !stateInfo}
                  variant="outline" 
                  className="flex-1"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Search {stateInfo?.name || userState} Database
                </Button>
                <Button
                  onClick={confirmStateSearch}
                  disabled={!trustBaseName.trim() || stateSearchCompleted}
                  variant={stateSearchCompleted ? "default" : "neon-purple"}
                >
                  {stateSearchCompleted ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    'Confirm Search'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {usptoSearchCompleted && stateSearchCompleted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Name Verification Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-800 mb-2">
                    Trust Name: {fullTrustName}
                  </p>
                  <p className="text-sm text-green-700">
                    Both USPTO and {stateInfo?.name || userState} state searches have been completed. 
                    You can now proceed to the next step.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          Back to Identity
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!usptoSearchCompleted || !stateSearchCompleted} 
          size="lg"
          variant="neon-green"
        >
          Continue to Ordination
        </Button>
      </div>
    </div>
  );
};

export default StepTrustName;