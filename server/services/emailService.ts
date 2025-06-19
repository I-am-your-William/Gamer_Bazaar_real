import { Order, Product, QrCode } from '@shared/schema';

interface OrderItem {
  productName: string;
  quantity: number;
  price: string;
  productImage?: string;
}

class EmailService {
  async sendOrderConfirmation(
    email: string, 
    order: Order, 
    orderItems: OrderItem[]
  ): Promise<void> {
    try {
      console.log(`[EMAIL] Order confirmation sent to ${email}`);
      console.log(`Order #${order.orderNumber} - Total: $${order.totalAmount}`);
      console.log('Items:', orderItems.map(item => `${item.productName} x${item.quantity}`));
      
      // In a real implementation, you would use nodemailer or another email service
      // await this.sendEmail({
      //   to: email,
      //   subject: `Order Confirmation - ${order.orderNumber}`,
      //   template: 'order-confirmation',
      //   data: { order, orderItems }
      // });
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
    }
  }

  async sendVerificationConfirmation(
    email: string,
    product: Product,
    qrCode: QrCode
  ): Promise<void> {
    try {
      console.log(`[EMAIL] Product verification confirmation sent to ${email}`);
      console.log(`Product: ${product.name}`);
      console.log(`Serial: ${qrCode.serialNumber}`);
      console.log(`Verified at: ${qrCode.verifiedAt}`);
      
      // In a real implementation, you would use nodemailer or another email service
      // await this.sendEmail({
      //   to: email,
      //   subject: `Product Verification Confirmed - ${product.name}`,
      //   template: 'verification-confirmation',
      //   data: { product, qrCode }
      // });
    } catch (error) {
      console.error('Failed to send verification confirmation email:', error);
    }
  }

  async sendNewsletterSubscription(email: string): Promise<void> {
    try {
      console.log(`[EMAIL] Newsletter subscription confirmation sent to ${email}`);
      
      // In a real implementation, you would use nodemailer or another email service
      // await this.sendEmail({
      //   to: email,
      //   subject: 'Welcome to Gamers Bazaar Newsletter',
      //   template: 'newsletter-welcome',
      //   data: { email }
      // });
    } catch (error) {
      console.error('Failed to send newsletter subscription email:', error);
    }
  }

  // In a real implementation, this would use nodemailer
  // private async sendEmail(options: {
  //   to: string;
  //   subject: string;
  //   template: string;
  //   data: any;
  // }): Promise<void> {
  //   // Implementation with nodemailer
  // }
}

export const emailService = new EmailService();
