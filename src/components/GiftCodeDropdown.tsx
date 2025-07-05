import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Gift, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const GiftCodeDropdown = () => {
  const [giftCode, setGiftCode] = useState('');
  const [validatingGift, setValidatingGift] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateGiftCode = async () => {
    if (!giftCode.trim() || !user) return;

    setValidatingGift(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('validate-gift-code', {
        body: {
          code: giftCode.trim().toUpperCase(),
          userId: user.id
        }
      });

      if (error) throw error;

      if (response.valid) {
        // Redeem the gift code
        const { error: redeemError } = await supabase.functions.invoke('redeem-gift-code', {
          body: {
            giftCodeId: response.giftCodeId,
            userId: user.id
          }
        });

        if (redeemError) throw redeemError;

        toast({
          title: "Gift code applied!",
          description: "You now have access to the course. Redirecting...",
        });

        // Close the dropdown and navigate to the course
        setIsOpen(false);
        setGiftCode('');
        navigate('/automation');
      } else {
        toast({
          title: "Invalid gift code",
          description: "Please check your code and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Gift code error:', error);
      toast({
        title: "Error validating gift code",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setValidatingGift(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setGiftCode('');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-primary hover:text-primary hover:bg-primary/10"
        >
          <Gift className="h-4 w-4" />
          <span className="hidden sm:inline">Gift Code</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-background border-primary/30" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Gift className="h-5 w-5" />
              Have a Gift Code?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nav-gift-code" className="text-foreground">
                Gift Code
              </Label>
              <Input
                id="nav-gift-code"
                placeholder="Enter your gift code"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                disabled={validatingGift}
                className="bg-background border-primary/30"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && giftCode.trim() && user && !validatingGift) {
                    validateGiftCode();
                  }
                }}
              />
            </div>
            
            <Button 
              onClick={validateGiftCode}
              disabled={!giftCode.trim() || validatingGift || !user}
              className="w-full btn-royal-gold"
            >
              {validatingGift ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Apply Gift Code'
              )}
            </Button>
            
            {!user && (
              <p className="text-sm text-muted-foreground text-center">
                Please sign in to use a gift code
              </p>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default GiftCodeDropdown;