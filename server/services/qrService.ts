import { v4 as uuidv4 } from 'uuid';
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
  generateQRCodeDataURL(code: string): string {
    // This would typically use a QR code generation library
    // For now, we'll return a placeholder URL that can be used with qr-server.com
    const verifyURL = this.generateQRCodeURL(code);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyURL)}`;
  }
}

export const qrService = new QRService();
