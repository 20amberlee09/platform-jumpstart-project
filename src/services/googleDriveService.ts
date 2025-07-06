interface GoogleDriveConfig {
  driveUrl: string;
  folderId?: string;
}

interface DocumentToUpload {
  fileName: string;
  fileUrl: string;
  documentType: string;
  content?: Blob;
}

interface DriveUrlValidation {
  isValid: boolean;
  isDriveLink: boolean;
  hasShareParams: boolean;
  folderId?: string;
}

export class GoogleDriveService {
  private static extractFolderIdFromUrl(driveUrl: string): string | null {
    // Extract folder ID from Google Drive share URL
    const folderIdMatch = driveUrl.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    return folderIdMatch ? folderIdMatch[1] : null;
  }

  /**
   * Validate Google Drive URL format and structure
   */
  static validateGoogleDriveUrl(url: string): DriveUrlValidation {
    const isDriveLink = url.includes('drive.google.com') && url.includes('folders');
    const hasShareParams = url.includes('/share') || url.includes('usp=sharing');
    const isValid = isDriveLink && (hasShareParams || url.includes('/folders/'));
    const folderId = this.extractFolderIdFromUrl(url);
    
    return {
      isValid,
      isDriveLink,
      hasShareParams,
      folderId
    };
  }

  /**
   * Extract Google Drive file ID from various URL formats
   */
  static extractDriveFileId(url: string): string | null {
    // Handle various Google Drive URL formats
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/,  // File URLs
      /\/folders\/([a-zA-Z0-9-_]+)/,  // Folder URLs
      /id=([a-zA-Z0-9-_]+)/           // Query parameter format
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  /**
   * Generate shareable link for Google Drive file/folder
   */
  static generateSharableLink(fileId: string, type: 'file' | 'folder' = 'folder'): string {
    const baseUrl = type === 'file' 
      ? `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
      : `https://drive.google.com/drive/folders/${fileId}?usp=sharing`;
    
    return baseUrl;
  }

  /**
   * Create folder structure name for user documents
   */
  static createFolderStructure(folderName: string, userName?: string): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sanitizedFolderName = folderName.replace(/[^a-zA-Z0-9\s-_]/g, '');
    const sanitizedUserName = userName ? userName.replace(/[^a-zA-Z0-9\s-_]/g, '') : '';
    
    return userName 
      ? `${sanitizedFolderName} - ${sanitizedUserName} - ${timestamp}`
      : `${sanitizedFolderName} - ${timestamp}`;
  }

  /**
   * Generate shareable link for document upload
   * Since direct API upload requires OAuth, we'll provide download links and instructions
   */
  static async prepareDocumentsForDrive(
    documents: DocumentToUpload[],
    driveConfig: GoogleDriveConfig
  ): Promise<{
    downloadLinks: Array<{
      fileName: string;
      downloadUrl: string;
      documentType: string;
    }>;
    uploadInstructions: string;
    folderUrl: string;
  }> {
    const folderId = this.extractFolderIdFromUrl(driveConfig.driveUrl);
    
    return {
      downloadLinks: documents.map(doc => ({
        fileName: doc.fileName,
        downloadUrl: doc.fileUrl,
        documentType: doc.documentType
      })),
      uploadInstructions: `
        To save your documents to Google Drive:
        1. Click each download link below to save documents to your computer
        2. Open your Google Drive folder: ${driveConfig.driveUrl}
        3. Drag and drop the downloaded files into your Drive folder
        
        Alternatively, we'll send you an email with all download links for easy access.
      `,
      folderUrl: driveConfig.driveUrl
    };
  }

  /**
   * Create organized folder structure in user's drive
   */
  static generateFolderStructure(courseName: string, userName: string): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${courseName} - ${userName} - ${timestamp}`;
  }

  /**
   * Validate Google Drive URL format
   */
  static isValidDriveUrl(url: string): boolean {
    const driveUrlPattern = /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9-_]+/;
    return driveUrlPattern.test(url);
  }

  /**
   * Generate Google Drive folder creation URL
   */
  static generateFolderCreationUrl(folderName: string): string {
    const encodedName = encodeURIComponent(folderName);
    return `https://drive.google.com/drive/folders/new?name=${encodedName}`;
  }
}