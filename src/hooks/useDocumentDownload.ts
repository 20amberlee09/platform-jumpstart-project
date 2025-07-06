import { useState } from 'react';
import { createProfessionalPDF, generateDocumentHash } from '@/utils/pdfGenerator';
import { BlockchainService } from '@/services/documentService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
      console.log('Starting document generation for:', documentType);

      // 1. Generate professional PDF
      const pdf = createProfessionalPDF(documentType, data);
      const pdfBlob = pdf.output('blob');
      console.log('PDF generated successfully');

      // 2. Generate document hash
      const documentHash = await generateDocumentHash(pdfBlob);
      console.log('Document hash generated:', documentHash);

      // 3. Submit to blockchain
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const blockchainResult = await BlockchainService.submitToBlockchain(
        documentHash,
        documentId,
        {
          userId: user.id,
          ministerName: data.ministerName,
          trustName: data.trustName
        }
      );
      console.log('Blockchain submission successful:', blockchainResult.transactionHash);

      // 4. Upload document to storage with user-specific path
      const fileName = `${user.id}/${documentType}_${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to store document');
      }

      console.log('Document uploaded to storage:', uploadData.path);

      // 5. Save document record to database
      const { error: dbError } = await supabase
        .from('document_files')
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_name: fileName,
          file_url: uploadData.path,
          file_type: 'application/pdf',
          metadata: {
            document_hash: documentHash,
            blockchain_tx_hash: blockchainResult.transactionHash,
            verification_status: 'verified'
          }
        });

      if (dbError) {
        console.error('Database save error:', dbError);
        // Don't throw - document still downloads even if DB save fails
      }

      // 6. Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentType}_verified.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Document Generated Successfully",
        description: `${documentType} has been verified on blockchain and downloaded.`,
      });

      console.log('Document download completed successfully');

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