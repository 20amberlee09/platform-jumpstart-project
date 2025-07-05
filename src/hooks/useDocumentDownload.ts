import { useToast } from '@/hooks/use-toast';
import { createProfessionalPDF, DocumentData } from '@/utils/pdfGenerator';

export const useDocumentDownload = () => {
  const { toast } = useToast();

  const downloadDocument = (documentType: string, data: DocumentData) => {
    try {
      // Create PDF
      const pdf = createProfessionalPDF(documentType, data);
      const fileName = `${documentType.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Use direct jsPDF save method which is most reliable
      pdf.save(fileName);
      
      toast({
        title: "Download Started",
        description: `${documentType} is being downloaded.`,
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: `Error downloading ${documentType}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  return { downloadDocument };
};