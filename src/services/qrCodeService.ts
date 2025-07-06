import QRCode from 'qrcode';

export class QRCodeService {
  static async generateVerificationQR(transactionHash: string, size: number = 200): Promise<string> {
    try {
      // Generate QR code that links to actual XRP Ledger transaction
      const verificationUrl = `https://xrpscan.com/tx/${transactionHash}`;
      
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return qrDataUrl;
    } catch (error) {
      console.error('Failed to generate verification QR code:', error);
      throw new Error('Failed to generate verification QR code');
    }
  }

  static async generateDriveQR(driveUrl: string, size: number = 200): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(driveUrl, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrDataUrl;
    } catch (error) {
      console.error('Failed to generate Drive QR code:', error);
      throw new Error('Failed to generate Drive QR code');
    }
  }

  static async generateBarcodeQR(barcodeData: string, size: number = 200): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(barcodeData, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrDataUrl;
    } catch (error) {
      console.error('Failed to generate barcode QR code:', error);
      throw new Error('Failed to generate barcode QR code');
    }
  }

  static async generateEmailQR(email: string, size: number = 200): Promise<string> {
    try {
      const emailUrl = `mailto:${email}`;
      const qrDataUrl = await QRCode.toDataURL(emailUrl, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrDataUrl;
    } catch (error) {
      console.error('Failed to generate email QR code:', error);
      throw new Error('Failed to generate email QR code');
    }
  }
}