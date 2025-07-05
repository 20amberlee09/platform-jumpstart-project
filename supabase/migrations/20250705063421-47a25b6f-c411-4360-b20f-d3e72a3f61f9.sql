-- Allow users to view their own redeemed gift codes
CREATE POLICY "Users can view their own redeemed gift codes" 
ON public.gift_codes 
FOR SELECT 
USING (auth.uid() = used_by);