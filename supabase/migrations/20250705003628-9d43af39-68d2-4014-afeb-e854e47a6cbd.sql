-- Create gift codes table
CREATE TABLE public.gift_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage gift codes" 
ON public.gift_codes 
FOR ALL 
USING (EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view unused gift codes for validation" 
ON public.gift_codes 
FOR SELECT 
USING (used_by IS NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_gift_codes_updated_at
  BEFORE UPDATE ON public.gift_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();