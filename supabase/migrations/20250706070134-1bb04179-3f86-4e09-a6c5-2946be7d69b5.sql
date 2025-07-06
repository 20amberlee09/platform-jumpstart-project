-- Add missing columns to modules table
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS templates JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::JSONB;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS title TEXT;

-- Update existing modules to have title from name if title is null
UPDATE public.modules SET title = name WHERE title IS NULL;

-- Make title NOT NULL after populating
ALTER TABLE public.modules ALTER COLUMN title SET NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON public.document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON public.document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON public.modules(course_id, order_index);

-- Update document_templates table structure if needed
ALTER TABLE public.document_templates ADD COLUMN IF NOT EXISTS template_fields JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.document_templates ADD COLUMN IF NOT EXISTS template_content TEXT;
ALTER TABLE public.document_templates ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.document_templates ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);