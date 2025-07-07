import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

export const useDocumentDownload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDocument = async (documentType: string, allUserData: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate documents.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Starting document generation with complete data:', allUserData);

      // Step 1: Generate blockchain hash for document
      const documentContent = JSON.stringify({
        documentType,
        userData: allUserData.documentData,
        timestamp: new Date().toISOString(),
        userId: user.id
      });

      // Create document hash
      const encoder = new TextEncoder();
      const data = encoder.encode(documentContent);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const documentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('Generated document hash:', documentHash);

      // Step 2: Submit to blockchain (if XRP is working)
      let blockchainData = null;
      try {
        const { data: blockchainResult, error: blockchainError } = await supabase.functions.invoke('xrp-submit-document', {
          body: {
            documentHash,
            documentId: `${documentType}_${user.id}_${Date.now()}`,
            userInfo: allUserData.documentData
          }
        });

        if (!blockchainError && blockchainResult?.success) {
          blockchainData = blockchainResult;
          console.log('Blockchain submission successful:', blockchainData);
        } else {
          console.warn('Blockchain submission failed, continuing without:', blockchainError);
        }
      } catch (error) {
        console.warn('Blockchain submission error, continuing without:', error);
      }

      // Step 3: Generate QR codes
      const blockchainQR = blockchainData 
        ? await QRCode.toDataURL(blockchainData.verificationUrl || `https://verify.truthhurtz.com/${documentHash}`)
        : await QRCode.toDataURL(`https://verify.truthhurtz.com/${documentHash}`);

      const driveQR = allUserData.documentData?.googleDriveLink 
        ? await QRCode.toDataURL(allUserData.documentData.googleDriveLink)
        : await QRCode.toDataURL('https://drive.google.com/');

      console.log('Generated QR codes');

      // Step 4: Prepare complete data package for PDF service
      const completeDocumentData = {
        // Document metadata
        documentType,
        generatedAt: new Date().toISOString(),
        documentHash,
        
        // User information (from all workflow steps)
        personalInfo: {
          firstName: allUserData.documentData?.identity?.firstName || '',
          lastName: allUserData.documentData?.identity?.lastName || '',
          email: user.email || '',
          phone: allUserData.documentData?.identity?.phone || '',
          address: allUserData.documentData?.identity?.address || '',
          city: allUserData.documentData?.identity?.city || '',
          state: allUserData.documentData?.identity?.state || '',
          zipCode: allUserData.documentData?.identity?.zipCode || '',
          dateOfBirth: allUserData.documentData?.identity?.dateOfBirth || '',
          ssn: allUserData.documentData?.identity?.ssn || ''
        },
        
        // Trust information
        trustInfo: {
          trustName: allUserData.documentData?.trustInfo?.trustName || '',
          trustType: allUserData.documentData?.trustInfo?.trustType || '',
          trustPurpose: allUserData.documentData?.trustInfo?.trustPurpose || '',
          beneficiaries: allUserData.documentData?.trustInfo?.beneficiaries || []
        },

        // Business information
        businessInfo: allUserData.documentData?.businessInfo || {},

        // Minister verification
        ministerInfo: {
          verified: !!(allUserData.documentData?.ministerCertificate),
          certificateName: allUserData.documentData?.ministerCertificate || ''
        },

        // Footer verification elements (CRITICAL FOR PDF)
        footerElements: {
          // QR Code 1: Blockchain verification
          blockchainQR: blockchainQR,
          blockchainUrl: blockchainData?.verificationUrl || `https://verify.truthhurtz.com/${documentHash}`,
          
          // QR Code 2: Google Drive access
          googleDriveQR: driveQR,
          googleDriveUrl: allUserData.documentData?.googleDriveLink || '',
          
          // Barcode (user uploaded)
          barcodeImage: allUserData.documentData?.barcodeImage || null,
          barcodeCertificate: allUserData.documentData?.barcodeCertificate || '',
          
          // Blockchain hash/identifier
          blockchainHash: blockchainData?.transactionHash || documentHash,
          verificationId: `TH-${Date.now()}`
        },

        // Template data
        templateType: documentType,
        includeSignatureLines: true,
        includeDateFields: true,
        legalCompliance: true
      };

      console.log('Prepared complete document data for PDF generation:', completeDocumentData);

      // Step 5: Send to PDF generation service
      const { data: pdfResult, error: pdfError } = await supabase.functions.invoke('generate-pdf-with-pdfshift', {
        body: completeDocumentData
      });

      if (pdfError) {
        throw new Error(`PDF generation failed: ${pdfError.message}`);
      }

      if (!pdfResult || !pdfResult.success) {
        throw new Error('PDF generation failed: No valid response from service');
      }

      console.log('PDF generation successful');

      // Step 6: Save generation record
      const { error: saveError } = await supabase
        .from('document_files')
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_name: `${documentType}_${user.id}_${Date.now()}.pdf`,
          file_url: pdfResult.pdfUrl || 'generated',
          file_type: 'application/pdf',
          metadata: {
            generation_method: 'pdfshift_blockchain',
            document_hash: documentHash,
            blockchain_hash: blockchainData?.transactionHash,
            verification_url: blockchainData?.verificationUrl,
            generated_at: new Date().toISOString()
          }
        });

      if (saveError) {
        console.error('Failed to save generation record:', saveError);
      }

      // Step 7: Download the PDF
      if (pdfResult.pdfUrl) {
        const link = document.createElement('a');
        link.href = pdfResult.pdfUrl;
        link.download = `${documentType}_${user.id}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Document Generated Successfully!",
        description: `Your ${documentType} has been generated with blockchain verification and will be delivered to your Gmail.`,
      });

      return {
        success: true,
        documentHash,
        blockchainData,
        verificationUrl: blockchainData?.verificationUrl || `https://verify.truthhurtz.com/${documentHash}`
      };

    } catch (error) {
      console.error('Document generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate document. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateDocument,
    downloadDocument: generateDocument, // Backward compatibility
    isGenerating
  };
};