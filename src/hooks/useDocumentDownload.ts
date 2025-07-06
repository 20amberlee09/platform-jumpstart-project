import { useState } from 'react';
import { BlockchainService } from '@/services/documentService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PDFShiftService } from '@/services/pdfShiftService';
import { generateDocumentHash } from '@/utils/generateDocumentHash';

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
      console.log('Starting PDFShift document generation for:', documentType);

      // 1. Prepare document data
      const documentData: any = {
        ministerName: data.ministerName || '[Minister Name]',
        trustName: data.trustName || '[Trust Name]',
        todayDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        identityData: data.identityData || {},
        trustData: data.trustData || {},
        gmailData: data.gmailData || {},
        verificationData: data.verificationData || {},
        blockchainTxHash: ''
      };

      // 2. Select template based on document type
      let templateHtml: string;
      if (documentType === "Certificate of Trust (Summary)" || documentType === "Certificate of Trust (Detailed)") {
        templateHtml = PDFShiftService.createCertificateTemplate();
      } else if (documentType === "Declaration of Trust") {
        templateHtml = PDFShiftService.createDeclarationTemplate();
      } else {
        // Use certificate template as default for other document types
        templateHtml = PDFShiftService.createCertificateTemplate();
      }

      // 3. Generate PDF using PDFShift Edge Function
      console.log('Calling PDFShift edge function...');
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-pdf-with-pdfshift', {
        body: {
          templateHtml,
          documentData,
          options: {
            format: 'A4',
            margin: '0.75in',
            orientation: 'portrait'
          }
        }
      });

      if (pdfError) {
        console.error('PDFShift generation error:', pdfError);
        throw new Error('Failed to generate PDF with PDFShift');
      }

      const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
      console.log('PDFShift PDF generated successfully');

      // 4. Generate document hash
      const documentHash = await generateDocumentHash(pdfBlob);
      console.log('Document hash generated:', documentHash);

      // Store blockchain hash in document data for template
      documentData.blockchainTxHash = documentHash;

      // 5. Submit to blockchain
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const blockchainResult = await BlockchainService.submitToBlockchain(
        documentHash,
        documentId,
        {
          userId: user.id,
          ministerName: documentData.ministerName,
          trustName: documentData.trustName
        }
      );
      console.log('Blockchain submission successful:', blockchainResult.transactionHash);

      // 6. Upload document to storage with user-specific path
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

      // 7. Save document record to database
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

      // 8. Download the PDF
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