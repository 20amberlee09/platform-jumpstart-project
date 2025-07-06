import { useToast } from '@/hooks/use-toast';
import { createProfessionalPDF, DocumentData, generateDocumentHash } from '@/utils/pdfGenerator';
import { BlockchainService } from '@/services/documentService';
import { useAuth } from './useAuth';

export const useDocumentDownload = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const downloadDocument = async (documentType: string, data: DocumentData) => {
    console.log('=== DOWNLOAD WITH BLOCKCHAIN DEBUG START ===');
    console.log('Document type:', documentType);
    console.log('Data received:', data);
    
    try {
      // Create PDF
      console.log('Creating PDF...');
      const pdf = createProfessionalPDF(documentType, data);
      console.log('PDF created successfully:', !!pdf);
      
      // Generate PDF buffer for hashing
      const pdfBuffer = pdf.output('arraybuffer');
      const uint8Array = new Uint8Array(pdfBuffer);
      console.log('PDF buffer size:', uint8Array.length);
      
      // Generate document hash
      console.log('Generating document hash...');
      const documentHash = generateDocumentHash(uint8Array);
      console.log('Document hash generated:', documentHash);
      
      // Submit to blockchain if user is authenticated
      let blockchainResult = null;
      if (user) {
        try {
          console.log('Submitting to blockchain...');
          const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          blockchainResult = await BlockchainService.submitToBlockchain(
            documentHash,
            documentId,
            {
              userId: user.id,
              ministerName: data.ministerName,
              trustName: data.trustName
            }
          );
          
          console.log('Blockchain submission successful:', blockchainResult.transactionHash);
          
          // Save verification record
          await BlockchainService.saveBlockchainVerification(
            blockchainResult.transactionHash,
            documentHash,
            user.id,
            documentId
          );
          
          toast({
            title: "Blockchain Verification Complete",
            description: `Document secured on XRP Ledger: ${blockchainResult.transactionHash.substring(0, 8)}...`,
          });
          
        } catch (blockchainError) {
          console.error('Blockchain submission failed:', blockchainError);
          toast({
            title: "Blockchain Warning",
            description: "Document generated but blockchain verification failed. PDF still downloadable.",
            variant: "destructive"
          });
        }
      }
      
      const fileName = `${documentType.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Generated filename:', fileName);
      
      // Method 1: Direct jsPDF save (most reliable)
      console.log('Attempting Method 1: jsPDF.save()');
      try {
        pdf.save(fileName);
        console.log('jsPDF.save() executed successfully');
        
        toast({
          title: blockchainResult ? "Document Downloaded & Verified" : "Document Downloaded",
          description: blockchainResult 
            ? `Document secured on blockchain and downloaded: ${documentType}` 
            : `Downloaded: ${documentType}`,
        });
      } catch (saveError) {
        console.error('jsPDF.save() failed:', saveError);
      }
      
      // Method 2: Blob approach as fallback
      console.log('Attempting Method 2: Blob download');
      try {
        const pdfOutput = pdf.output('blob');
        console.log('Blob created, size:', pdfOutput.size);
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(pdfOutput);
        
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        console.log('Download link added to DOM');
        
        // Force click with event
        link.click();
        console.log('Click triggered');
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('Cleanup completed');
        }, 100);
        
      } catch (blobError) {
        console.error('Blob method failed:', blobError);
      }
      
      // Method 3: Data URL approach
      console.log('Attempting Method 3: Data URL');
      try {
        const dataUri = pdf.output('datauristring');
        console.log('Data URI length:', dataUri.length);
        
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        console.log('Data URI method completed');
      } catch (dataError) {
        console.error('Data URI method failed:', dataError);
      }
      
      // Method 4: Force download with window.open fallback
      console.log('Attempting Method 4: window.open fallback');
      try {
        const pdfDataUri = pdf.output('datauristring');
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Download ${documentType}</title></head>
              <body>
                <h1>Document Ready</h1>
                <p>If download doesn't start automatically, <a href="${pdfDataUri}" download="${fileName}">click here</a></p>
                <script>
                  window.onload = function() {
                    var a = document.createElement('a');
                    a.href = '${pdfDataUri}';
                    a.download = '${fileName}';
                    a.click();
                  }
                </script>
              </body>
            </html>
          `);
          console.log('Fallback window opened');
        }
      } catch (windowError) {
        console.error('Window.open method failed:', windowError);
      }
      
    } catch (error) {
      console.error('CRITICAL DOWNLOAD ERROR:', error);
      toast({
        title: "Download Failed",
        description: `Critical error: ${error.message}. Check console for details.`,
        variant: "destructive"
      });
    }
    
    console.log('=== DOWNLOAD WITH BLOCKCHAIN DEBUG END ===');
  };

  return { downloadDocument };
};