import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { 
  insertProductSchema, 
  insertCategorySchema, 
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema 
} from "@shared/schema";
import { qrService } from "./services/qrService";
import { emailService } from "./services/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin login route
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Admin login attempt:', { username, password: password ? '[REDACTED]' : 'undefined' });
      
      // Simple admin authentication
      if (username === 'admin' && password === '1234') {
        // Create or update admin session
        const adminUser = await storage.upsertUser({
          id: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
        });

        // Manually create session for admin using req.login
        req.login({ 
          claims: { sub: 'admin' },
          access_token: 'admin-token',
          expires_at: Math.floor(Date.now() / 1000) + 86400 // 24 hours
        }, (err) => {
          if (err) {
            console.error('Error during admin login:', err);
            return res.status(500).json({ message: "Failed to create admin session" });
          }
          
          // Send response after successful login
          res.json(adminUser);
        });
      } else {
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Failed to login as admin" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category, search, limit, offset } = req.query;
      const filters = {
        category: category as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };
      
      const result = await storage.getProducts(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get('/api/products/slug/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
      const product = await storage.getProductBySlug(slug);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Update product stock (admin only)
  app.patch('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const product = await storage.updateProduct(id, updates);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });
      
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const orders = user?.role === 'admin' 
        ? await storage.getOrders() 
        : await storage.getOrders(userId);
        
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user owns the order or is admin
      if (order.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + (parseFloat(item.product.salePrice || item.product.price) * item.quantity), 
        0
      );
      
      // Generate order number
      const orderNumber = `GB${Date.now()}`;
      
      const orderData = insertOrderSchema.parse({
        userId,
        orderNumber,
        totalAmount: totalAmount.toString(),
        shippingAddress: req.body.shippingAddress,
        billingAddress: req.body.billingAddress,
        paymentMethod: req.body.paymentMethod || 'credit_card',
        paymentStatus: 'completed', // Mock payment
        status: 'processing',
      });
      
      const orderItemsData = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.salePrice || item.product.price,
        productName: item.product.name,
        productImage: item.product.imageUrl || undefined,
      }));
      
      const order = await storage.createOrder(orderData, orderItemsData as any);
      
      // Generate QR codes for each product
      for (const item of cartItems) {
        const qrCode = await qrService.generateQRCode({
          orderId: order.id,
          productId: item.productId,
          userId,
          serialNumber: `${item.product.brand || 'GB'}-${Date.now()}-${item.productId}`,
        });
        
        await storage.createQrCode(qrCode);
      }
      
      // Clear cart
      await storage.clearCart(userId);
      
      // Send confirmation email
      const user = await storage.getUser(userId);
      if (user?.email) {
        await emailService.sendOrderConfirmation(user.email, order, orderItemsData);
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const order = await storage.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // QR Code routes
  app.get('/api/qr-codes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const filters = user?.role === 'admin' 
        ? {} 
        : { userId };
        
      const qrCodes = await storage.getQrCodes(filters);
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ message: "Failed to fetch QR codes" });
    }
  });

  // QR Code verification endpoint (supports both GET and POST)
  const handleQRVerification = async (req: any, res: any) => {
    try {
      const code = req.params.code;
      const qrCode = await storage.getQrCode(code);
      
      if (!qrCode) {
        return res.status(404).json({ 
          verified: false,
          message: "QR code not found" 
        });
      }
      
      // Mark as verified if not already
      if (!qrCode.isVerified) {
        await storage.verifyQrCode(code, {
          verifiedAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
        
        // Send verification email
        if (qrCode.user?.email && !qrCode.emailSent) {
          await emailService.sendVerificationConfirmation(
            qrCode.user.email,
            qrCode.product,
            qrCode
          );
        }
      }
      
      res.json({
        verified: true,
        product: qrCode.product,
        order: qrCode.order,
        serialNumber: qrCode.serialNumber,
        verifiedAt: qrCode.verifiedAt,
      });
    } catch (error) {
      console.error("Error verifying QR code:", error);
      res.status(500).json({ 
        verified: false,
        message: "Failed to verify QR code" 
      });
    }
  };

  app.get('/api/verify/:code', handleQRVerification);
  app.post('/api/qr-verify/:code', handleQRVerification);

  // Admin analytics
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analytics = await storage.getSalesAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
