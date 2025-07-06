import QRCode from 'qrcode';

export class QRCodeService {
  // Generate QR code for blockchain verification
  static async generateVerificationQR(
    blockchainResult: {
      transactionHash: string;
      verificationUrl: string;
      qrCodeData: string;
    },
    size: number = 200
  ): Promise<string> {
    try {
      // Generate QR code with verification data
      const qrCodeDataURL = await QRCode.toDataURL(blockchainResult.qrCodeData, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw new Error('Failed to generate verification QR code');
    }
  }

  // Generate QR code for Google Drive URL
  static async generateDriveQR(driveUrl: string, size: number = 150): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(driveUrl, {
        width: size,
        margin: 1,
        color: {
          dark: '#1a73e8', // Google Drive blue
          light: '#FFFFFF'
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Drive QR Code generation failed:', error);
      throw new Error('Failed to generate Google Drive QR code');
    }
  }

  // Generate QR code for barcode verification
  static async generateBarcodeQR(barcodeData: string, size: number = 150): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(barcodeData, {
        width: size,
        margin: 1,
        color: {
          dark: '#2563eb', // Blue color for barcode QR
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Barcode QR Code generation failed:', error);
      throw new Error('Failed to generate barcode QR code');
    }
  }

  // Generate QR code for trust email
  static async generateEmailQR(email: string, size: number = 150): Promise<string> {
    try {
      const mailtoUrl = `mailto:${email}`;
      const qrCodeDataURL = await QRCode.toDataURL(mailtoUrl, {
        width: size,
        margin: 1,
        color: {
          dark: '#059669', // Green color for email QR
          light: '#FFFFFF'
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Email QR Code generation failed:', error);
      throw new Error('Failed to generate email QR code');
    }
  }
}