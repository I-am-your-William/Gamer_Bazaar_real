import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { InsertQrCode } from '@shared/schema';

interface QRCodeData {
  orderId: number;
  productId: number;
  userId: string;
  serialNumber: string;
}

class QRService {
  generateQRCode(data: QRCodeData): InsertQrCode {
    const code = uuidv4();
    
    return {
      code,
      orderId: data.orderId,
      productId: data.productId,
      userId: data.userId,
      serialNumber: data.serialNumber,
      isVerified: false,
      emailSent: false,
    };
  }

  // Generate QR code URL for frontend rendering
  generateQRCodeURL(code: string): string {
    // In a real implementation, you would use the actual domain
    const baseURL = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}` 
      : 'http://localhost:5000';
    
    return `${baseURL}/verify/${code}`;
  }

  // Generate QR code data URL for embedding in emails/documents
  async generateQRCodeDataURL(code: string): Promise<string> {
    try {
      const verifyURL = this.generateQRCodeURL(code);
      // Generate QR code as base64 data URL using the qrcode library
      const qrDataURL = await QRCode.toDataURL(verifyURL, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      return qrDataURL;
    } catch (error) {
      console.error('Failed to generate QR code locally, falling back to API:', error);
      // Fallback to QR Server API
      const verifyURL = this.generateQRCodeURL(code);
      return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(verifyURL)}`;
    }
  }

  // Generate QR code for gaming theme with custom styling
  async generateStyledQRCode(code: string, options?: {
    foreground?: string;
    background?: string;
    size?: number;
  }): Promise<string> {
    try {
      const verifyURL = this.generateQRCodeURL(code);
      const qrDataURL = await QRCode.toDataURL(verifyURL, {
        errorCorrectionLevel: 'H', // High error correction for styled codes
        type: 'image/png',
        quality: 0.92,
        margin: 2,
        color: {
          dark: options?.foreground || '#00FF88', // Gaming green
          light: options?.background || '#0A0A0A'  // Dark background
        },
        width: options?.size || 300
      });
      return qrDataURL;
    } catch (error) {
      console.error('Failed to generate styled QR code:', error);
      return this.generateQRCodeDataURL(code);
    }
  }

  // Alternative API methods for different QR code services
  getQRServerURL(code: string, size: number = 200): string {
    const verifyURL = this.generateQRCodeURL(code);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(verifyURL)}`;
  }

  getGoQRURL(code: string, size: number = 200): string {
    const verifyURL = this.generateQRCodeURL(code);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(verifyURL)}&format=png`;
  }
}

export const qrService = new QRService();
