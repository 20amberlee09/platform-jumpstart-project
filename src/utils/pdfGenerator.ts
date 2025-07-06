import jsPDF from 'jspdf';
import { XRPLService } from '@/services/xrplService';

export interface DocumentData {
  identityData?: any;
  trustData?: any;
  gmailData?: any;
  verificationData?: any;
  ministerName?: string;
  trustName?: string;
}

export const createProfessionalPDF = (documentType: string, data: DocumentData) => {
  const doc = new jsPDF();
  
  // Set professional fonts and styling
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  
  // Add letterhead-style header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ECCLESIASTICAL TRUST SERVICES", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Trust Administration • Legal Document Services", 105, 28, { align: "center" });
  doc.text("_______________________________________________________________________", 105, 35, { align: "center" });
  
  // Get data from previous steps
  const { identityData = {}, trustData = {}, gmailData = {}, verificationData = {} } = data;
  
  const ministerName = data.ministerName || identityData?.fullName || '[Minister Name]';
  const trustName = data.trustName || trustData?.trustName || '[Trust Name]';
  const todayDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let yPosition = 50;
  
  // Document title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(documentType.toUpperCase(), 105, yPosition, { align: "center" });
  yPosition += 15;
  
  // Create professional document content based on type
  if (documentType === "Certificate of Trust (Summary)") {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const content = [
      "",
      `This Certificate is executed by ${ministerName}, as Trustee of the`,
      `${trustName}, established on ${todayDate}.`,
      "",
      "1. TRUST EXISTENCE:",
      `   The Trust named above is validly existing under ecclesiastical law and`,
      `   pursuant to a trust agreement dated ${todayDate}.`,
      "",
      "2. TRUSTEE AUTHORITY:",
      "   The undersigned Trustee has full power and authority to act on behalf",
      "   of the Trust in all matters related to trust administration, including:",
      "   • Acquiring, holding, and disposing of trust property",
      "   • Entering into contracts and agreements",
      "   • Managing trust assets and investments",
      "   • Distributing trust income and principal",
      "",
      "3. TRUST IDENTIFICATION:",
      `   Trust Name: ${trustName}`,
      `   Trustee: ${ministerName}`,
      `   Trust Email: ${gmailData?.gmailAccount || '[Trust Email]'}`,
      `   Document Repository: ${gmailData?.googleDriveFolder || '[Repository]'}`,
      `   Verification ID: ${verificationData?.barcodeNumber || '[Verification ID]'}`,
      "",
      "4. LIMITATION OF LIABILITY:",
      "   This Certificate is executed to facilitate transactions involving trust",
      "   property and does not modify, revoke, or otherwise affect the terms",
      "   of the Trust Agreement.",
      "",
      "IN WITNESS WHEREOF, the undersigned Trustee has executed this",
      `Certificate on ${todayDate}.`,
      "",
      "",
      "_________________________________",
      `${ministerName}, Trustee`,
      trustName,
      "",
      `Address: ${identityData?.address || '[Address]'}`,
      `${identityData?.city || '[City]'}, ${identityData?.state || '[State]'} ${identityData?.zipCode || '[Zip]'}`,
      "",
      "VERIFICATION ELEMENTS:",
      "□ Barcode Certificate Verification",
      "□ Digital Repository Access",
      "□ QR Code Authentication",
      "□ Ecclesiastical Seal Verification"
    ];
    
    content.forEach((line) => {
      if (line.startsWith('   ') || line.startsWith('   •')) {
        doc.setFont("helvetica", "normal");
        doc.text(line, 25, yPosition);
      } else if (line.match(/^\d+\./)) {
        doc.setFont("helvetica", "bold");
        doc.text(line, 20, yPosition);
      } else if (line.startsWith('□')) {
        doc.setFont("helvetica", "normal");
        doc.text(line, 25, yPosition);
      } else {
        doc.setFont("helvetica", "normal");
        doc.text(line, 20, yPosition);
      }
      yPosition += 6;
      
      // Add new page if needed
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });
  } else {
    // For other document types, create similar professional content
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Professional ${documentType} Document`, 20, yPosition);
    yPosition += 10;
    doc.text(`Generated for: ${ministerName}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Trust: ${trustName}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Date: ${todayDate}`, 20, yPosition);
    yPosition += 15;
    doc.text("This is a professionally formatted legal document that would", 20, yPosition);
    yPosition += 6;
    doc.text("contain the complete legal text for this document type.", 20, yPosition);
  }
  
  // Add footer with verification elements
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("This document contains verification elements and should be authenticated before use.", 105, 285, { align: "center" });
    doc.text(`Page ${i} of ${pageCount} • Generated ${todayDate}`, 105, 290, { align: "center" });
    
    // Add verification element placeholders
    doc.setFontSize(6);
    doc.text("QR1: Certificate", 25, 275);
    doc.text("Barcode: " + (verificationData?.barcodeNumber || 'N/A'), 105, 275, { align: "center" });
    doc.text("QR2: Drive", 185, 275);
  }
  
  return doc;
};

// Generate secure document hash from PDF buffer
export const generateDocumentHash = (pdfBuffer: Buffer | Uint8Array): string => {
  try {
    // Convert Uint8Array to Buffer if needed for compatibility
    const buffer = pdfBuffer instanceof Uint8Array ? Buffer.from(pdfBuffer) : pdfBuffer;
    return XRPLService.generateDocumentHash(buffer);
  } catch (error) {
    console.error('Document hash generation failed:', error);
    throw new Error('Failed to generate document hash');
  }
};