import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { Order, Product, QrCode } from '@shared/schema';

interface OrderItem {
  productName: string;
  quantity: number;
  price: string;
  productImage?: string;
  serialNumber?: string;
  securityCodeImage?: string;
}

interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  total: string;
  shippingAddress: string;
  orderDate: string;
  items: OrderItem[];
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.setupTransporter();
  }

  private async setupTransporter() {
    try {
      // Gmail configuration with environment variables
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (emailUser && emailPass) {
        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        // Verify connection
        await this.transporter.verify();
        console.log('✅ Gmail service configured successfully');
      } else {
        console.log('⚠️ Gmail credentials not provided - using console logging mode');
      }
    } catch (error) {
      console.log('⚠️ Gmail setup failed - using console logging mode:', error.message);
      this.transporter = null;
    }
  }

  private generateOrderEmailHTML(data: OrderEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Gamer Bazaar</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e9ecef; }
          .item-header { font-weight: bold; color: #667eea; margin-bottom: 10px; }
          .serial-info { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 10px 0; }
          .security-code { margin: 15px 0; text-align: center; }
          .security-code img { max-width: 200px; border: 2px solid #667eea; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎮 Gamer Bazaar</h1>
          <h2>Order Confirmation</h2>
          <p>Thank you for your order, ${data.customerName}!</p>
        </div>
        
        <div class="content">
          <div class="order-info">
            <h3>📦 Order Details</h3>
            <p><strong>Order ID:</strong> #${data.orderId}</p>
            <p><strong>Order Date:</strong> ${data.orderDate}</p>
            <p><strong>Total Amount:</strong> $${data.total}</p>
            <p><strong>Shipping Address:</strong> ${data.shippingAddress}</p>
          </div>

          <h3>🎯 Your Gaming Equipment</h3>
          ${data.items.map(item => `
            <div class="item">
              <div class="item-header">${item.productName}</div>
              <p><strong>Quantity:</strong> ${item.quantity}</p>
              <p><strong>Price:</strong> $${item.price} each</p>
              
              ${item.serialNumber ? `
                <div class="serial-info">
                  <h4>🔐 Product Authentication</h4>
                  <p><strong>Serial Number:</strong> <code>${item.serialNumber}</code></p>
                  <p style="font-size: 14px; color: #666;">Keep this serial number safe - you'll need it for warranty and support.</p>
                </div>
              ` : ''}
              
              ${item.securityCodeImage ? `
                <div class="security-code">
                  <h4>🛡️ Security Verification Code</h4>
                  <p>Scan this QR code to verify your product's authenticity:</p>
                  <img src="cid:security_${item.serialNumber}" alt="Security QR Code" />
                  <p style="font-size: 14px; color: #666;">Use our mobile app or website to scan this code and verify your product.</p>
                </div>
              ` : ''}
            </div>
          `).join('')}

          <div class="order-info" style="margin-top: 30px;">
            <h3>📱 Next Steps</h3>
            <ol>
              <li>Save your serial numbers in a safe place</li>
              <li>Use the QR codes to verify product authenticity</li>
              <li>Track your order status in your account</li>
              <li>Contact support if you have any questions</li>
            </ol>
          </div>
        </div>

        <div class="footer">
          <p>Questions? Contact us at support@gamerbazaar.com</p>
          <p>© 2025 Gamer Bazaar - Your Gaming Equipment Destination</p>
        </div>
      </body>
      </html>
    `;
  }

  async sendOrderConfirmation(
    email: string, 
    order: Order, 
    orderItems: OrderItem[]
  ): Promise<void> {
    try {
      if (!this.transporter) {
        // Enhanced console logging with detailed order information
        console.log(`\n📧 ORDER CONFIRMATION EMAIL (Console Mode)`);
        console.log(`===================================================`);
        console.log(`📫 To: ${email}`);
        console.log(`📦 Order #${order.orderNumber || order.id} - Total: $${order.totalAmount || order.total}`);
        console.log(`📅 Date: ${new Date().toLocaleDateString()}`);
        console.log(`\n🎯 GAMING EQUIPMENT ORDERED:`);
        
        orderItems.forEach((item, index) => {
          console.log(`\n${index + 1}. ${item.productName}`);
          console.log(`   Quantity: ${item.quantity} × $${item.price}`);
          if (item.serialNumber) {
            console.log(`   🔐 Serial Number: ${item.serialNumber}`);
          }
          if (item.securityCodeImage) {
            console.log(`   🛡️ Security QR Code: ${item.securityCodeImage}`);
          }
        });
        console.log(`\n===================================================\n`);
        return;
      }

      // Prepare email data for new format
      const emailData: OrderEmailData = {
        orderId: order.id,
        customerName: email.split('@')[0], // Extract name from email
        customerEmail: email,
        total: order.totalAmount?.toString() || order.total?.toString() || '0',
        shippingAddress: 'Shipping address from order',
        orderDate: new Date().toLocaleDateString(),
        items: orderItems
      };

      // Prepare attachments for security code images
      const attachments: any[] = [];
      orderItems.forEach(item => {
        if (item.securityCodeImage && item.serialNumber) {
          const imagePath = path.join(process.cwd(), item.securityCodeImage);
          if (fs.existsSync(imagePath)) {
            attachments.push({
              filename: `security_code_${item.serialNumber}.png`,
              path: imagePath,
              cid: `security_${item.serialNumber}`
            });
          }
        }
      });

      const mailOptions = {
        from: `"Gamer Bazaar Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🎮 Order Confirmation #${order.orderNumber || order.id} - Your Gaming Gear is Coming!`,
        html: this.generateOrderEmailHTML(emailData),
        attachments: attachments
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order confirmation email sent to ${email}`);

    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      // Fallback to console logging
      console.log(`\n📧 ORDER CONFIRMATION EMAIL (Fallback Mode)`);
      console.log(`📫 To: ${email}`);
      console.log(`📦 Order #${order.orderNumber || order.id} - Total: $${order.totalAmount || order.total}`);
    }
  }

  async sendVerificationConfirmation(
    email: string,
    product: Product,
    qrCode: QrCode
  ): Promise<void> {
    try {
      if (!this.transporter) {
        console.log(`📧 Product verification confirmation (Console Mode)`);
        console.log(`📫 To: ${email}`);
        console.log(`📦 Product: ${product.name}`);
        console.log(`🔍 QR Code: ${qrCode.code}`);
        console.log(`✅ Verified: ${qrCode.isVerified ? 'Yes' : 'No'}`);
        return;
      }

      const mailOptions = {
        from: `"Gamer Bazaar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `✅ Product Verified - ${product.name}`,
        html: `
          <h2>🎮 Product Verification Successful!</h2>
          <p>Your product <strong>${product.name}</strong> has been successfully verified.</p>
          <p><strong>Verification Code:</strong> ${qrCode.code}</p>
          <p><strong>Verified On:</strong> ${new Date().toLocaleDateString()}</p>
          <p>Thank you for choosing Gamer Bazaar!</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`);

    } catch (error) {
      console.error('Failed to send verification confirmation email:', error);
    }
  }

  async sendNewsletterSubscription(email: string): Promise<void> {
    console.log(`📧 Newsletter subscription confirmation (Console Mode)`);
    console.log(`📫 To: ${email}`);
    console.log(`🎮 Welcome to Gamer Bazaar newsletter!`);
  }
}

export const emailService = new EmailService();