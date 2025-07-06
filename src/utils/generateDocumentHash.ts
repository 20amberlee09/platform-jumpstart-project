// Generate secure document hash from PDF blob
export const generateDocumentHash = async (pdfBlob: Blob): Promise<string> => {
  try {
    // Convert Blob to ArrayBuffer for hashing
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Use Web Crypto API for browser compatibility
    const hashBuffer = await crypto.subtle.digest('SHA-512', uint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Document hash generation failed:', error);
    throw new Error('Failed to generate document hash');
  }
};