-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  overview_title TEXT,
  overview_subtitle TEXT,
  overview_description TEXT,
  features TEXT[], -- Array of feature strings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  component TEXT NOT NULL, -- Component name to render
  required BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL,
  icon TEXT, -- Lucide icon name
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for courses
CREATE POLICY "Everyone can view active courses" 
ON public.courses 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage courses" 
ON public.courses 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for modules
CREATE POLICY "Everyone can view modules of active courses" 
ON public.modules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = modules.course_id 
    AND courses.is_active = true
  )
);

CREATE POLICY "Admins can manage modules" 
ON public.modules 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial course data (migrating from hardcoded config)
INSERT INTO public.courses (
  id, title, description, price, overview_title, overview_subtitle, overview_description, features
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
  'Boot Camp documents',
  'Complete ecclesiastic revocable living trust creation with ministerial ordination',
  15000, -- $150.00 in cents
  'Boot Camp documents',
  'Complete Trust Creation Package',
  'Our comprehensive $150 package guides you through creating an ecclesiastic revocable living trust with ministerial ordination, verification services, and professional documentation. All required documents must be uploaded before completion.',
  ARRAY[
    'Complete $150 package - no recurring fees',
    'GUIDED: Government ID upload - you provide, we verify automatically',
    'AUTOMATED: Trust name availability verification (USPTO & State searches)',
    'GUIDED: Ministerial ordination certificate upload - you provide the certificate',
    'AUTOMATED: Ecclesiastic revocable living trust document creation',
    'AUTOMATED: Gmail account setup with proper trust naming convention',
    'AUTOMATED: Google Drive folder creation and organization',
    'AUTOMATED: QR code generation for all documentation',
    'GUIDED: Barcode certificate purchase guidance and upload',
    'GUIDED: Custom document seal creation and upload',
    'AUTOMATED: Professional document generation with all verification elements',
    'GUIDED: Document review - you approve before finalization',
    'AUTOMATED: Final document delivery to your Google Drive'
  ]
);

-- Insert initial modules data
INSERT INTO public.modules (course_id, name, description, component, required, order_index, icon) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Secure Payment', 'Automated payment processing - we handle all payment verification and course enrollment', 'StepPayment', true, 0, 'CreditCard'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'NDA Agreement', 'Guided step: You review and digitally sign the non-disclosure agreement', 'StepNDA', true, 1, 'Shield'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Identity Verification', 'Guided step: Upload your government ID - we automatically extract and verify your information using OCR technology', 'StepIdentity', true, 2, 'FileCheck'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Trust Name Selection', 'Guided step: Choose your trust name - we automatically search USPTO and state databases for availability', 'StepTrustName', true, 3, 'Search'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Minister Ordination', 'Guided step: Upload your ministerial certificate - we verify and integrate it into your trust documents', 'StepOrdination', true, 4, 'Award'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Gmail & Drive Setup', 'Automated process: We create your trust Gmail account and Google Drive folder with proper naming conventions', 'StepGmailSetup', true, 5, 'Mail'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Verification Tools', 'Guided step: Upload your barcode certificate and custom seal - we automatically generate QR codes and integrate everything', 'StepVerificationTools', true, 6, 'QrCode'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Document Generation', 'Fully automated: We generate all trust documents with your verification elements and deliver them to your Google Drive', 'StepDocumentGeneration', true, 7, 'FileText');