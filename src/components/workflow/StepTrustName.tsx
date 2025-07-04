import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StepTrustNameProps {
  onNext: (data: any) => void;
  onPrev: () => void;
  data: any;
}

const StepTrustName = ({ onNext, onPrev, data }: StepTrustNameProps) => {
  const [trustBaseName, setTrustBaseName] = useState(data?.trustBaseName || '');
  const [fullTrustName, setFullTrustName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    uspto: boolean | null;
    state: boolean | null;
    available: boolean;
  }>({ uspto: null, state: null, available: false });
  
  const { toast } = useToast();

  const generateFullTrustName = (baseName: string) => {
    return `${baseName} Ecclesiastic Revocable Living Trust`;
  };

  const handleBaseNameChange = (value: string) => {
    setTrustBaseName(value);
    const fullName = generateFullTrustName(value);
    setFullTrustName(fullName);
    // Reset search results when name changes
    setSearchResults({ uspto: null, state: null, available: false });
  };

  const searchTrustName = async () => {
    if (!trustBaseName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a trust name to search.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulate USPTO search (in real implementation, would call actual APIs)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const usptoAvailable = Math.random() > 0.3; // Simulate 70% availability
      
      // Simulate State Department search
      await new Promise(resolve => setTimeout(resolve, 1500));
      const stateAvailable = Math.random() > 0.2; // Simulate 80% availability
      
      const available = usptoAvailable && stateAvailable;
      
      setSearchResults({
        uspto: usptoAvailable,
        state: stateAvailable,
        available
      });

      if (available) {
        toast({
          title: "Great news!",
          description: "Your trust name is available for use.",
        });
      } else {
        toast({
          title: "Name Not Available",
          description: "Please try a different trust name.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search for trust name availability.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleNext = () => {
    if (!searchResults.available) {
      toast({
        title: "Verification Required",
        description: "Please verify your trust name is available before continuing.",
        variant: "destructive"
      });
      return;
    }
    
    onNext({ 
      trustBaseName, 
      fullTrustName,
      nameVerified: true,
      searchResults
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

          <div className="pt-4">
            <Button
              onClick={searchTrustName}
              disabled={!trustBaseName.trim() || isSearching}
              className="w-full"
              variant="neon-blue"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Name Availability
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(searchResults.uspto !== null || searchResults.state !== null) && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Verification results from USPTO and State Department searches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">USPTO Search</p>
                <p className="text-sm text-muted-foreground">Federal trademark database</p>
              </div>
              {searchResults.uspto === null ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : searchResults.uspto ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">State Department Search</p>
                <p className="text-sm text-muted-foreground">State entity registration</p>
              </div>
              {searchResults.state === null ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : searchResults.state ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            {searchResults.available && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="font-medium text-green-800">Name Available!</p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your trust name is available for use and registration.
                </p>
              </div>
            )}

            {!searchResults.available && searchResults.uspto !== null && searchResults.state !== null && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="font-medium text-red-800">Name Not Available</p>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Please choose a different trust name and search again.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          Back to Identity
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!searchResults.available} 
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