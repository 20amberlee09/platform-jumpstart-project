import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SimplePDFService } from '@/services/simplePdfService';

export const useDocumentDownload = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const downloadDocument = async (documentType: string, data: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to download documents.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Starting simple document generation for:', documentType);

      // Prepare document data with fallbacks
      const documentData = {
        ministerName: data.ministerName || data.identityData?.fullName || '[Minister Name]',
        trustName: data.trustName || '[Trust Name]',
        todayDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      // Generate and download the simple PDF
      const result = await SimplePDFService.generateAndDownload(documentData);

      // Save basic document record
      const { error: dbError } = await supabase
        .from('document_files')
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_name: result.filename,
          file_url: result.filename, // Local download
          file_type: 'application/pdf',
          metadata: {
            generation_method: 'simple_pdf',
            generated_at: new Date().toISOString()
          }
        });

      if (dbError) {
        console.warn('Database save error (non-critical):', dbError);
      }

      toast({
        title: "Document Generated Successfully",
        description: `${documentType} has been downloaded.`,
      });

      console.log('Simple document generation completed');

    } catch (error) {
      console.error('Document generation failed:', error);
      toast({
        title: "Document Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    downloadDocument,
    isGenerating
  };
};