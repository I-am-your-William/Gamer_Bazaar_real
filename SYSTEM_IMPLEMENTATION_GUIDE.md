# GamerBazaar System Implementation Guide

This document explains how key systems in GamerBazaar work, including QR codes, authentication, shopping cart, and payment processing.

## 🔐 Authentication System Implementation

### Backend Authentication (`server/localAuth.ts`)

The authentication system uses **Passport.js with local strategy** for username/password authentication.

#### Key Components:

1. **Password Security**
```javascript
// Using scrypt for secure password hashing
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
```

2. **Session Management**
```javascript
// PostgreSQL session storage
const sessionSettings: session.SessionOptions = {
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  store: new PostgresSessionStore({ pool, createTableIfMissing: true }),
};
```

3. **Authentication Endpoints**
```javascript
// Registration endpoint
app.post("/api/register", async (req, res, next) => {
  const existingUser = await storage.getUserByUsername(req.body.username);
  if (existingUser) {
    return res.status(400).send("Username already exists");
  }
  
  const user = await storage.createUser({
    ...req.body,
    password: await hashPassword(req.body.password),
  });
  
  req.login(user, (err) => {
    if (err) return next(err);
    res.status(201).json(user);
  });
});

// Login endpoint
app.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.status(200).json(req.user);
});
```

### Frontend Authentication (`client/src/hooks/use-auth.tsx`)

```javascript
export function useAuth() {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/auth/user"], user);
    },
  });
}
```

## 🛒 Shopping Cart System Implementation

### Backend Cart Operations (`server/storage.ts`)

#### Cart Data Structure
```sql
-- Cart items table stores user's cart
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Cart Management Functions
```javascript
async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
  return await db
    .select()
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
}

async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
  // Check if item already exists in cart
  const existingItem = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, cartItem.userId),
        eq(cartItems.productId, cartItem.productId)
      )
    );

  if (existingItem.length > 0) {
    // Update quantity if item exists
    return await this.updateCartItem(
      existingItem[0].id,
      existingItem[0].quantity + cartItem.quantity
    );
  } else {
    // Add new item
    const [newItem] = await db.insert(cartItems).values(cartItem).returning();
    return newItem;
  }
}
```

### Frontend Cart Management (`client/src/pages/cart.tsx`)

```javascript
export default function CartPage() {
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });
}
```

## 💳 Payment System Implementation

### Backend Order Processing (`server/routes.ts`)

#### Order Creation Process
```javascript
app.post("/api/orders", isAuthenticated, async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod } = req.body;
    const userId = req.user!.id;

    // Get user's cart items
    const cartItems = await storage.getCartItems(userId);
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );

    // Create order
    const order = await storage.createOrder({
      userId,
      orderNumber: `ORD-${Date.now()}`,
      total: total.toString(),
      status: "pending",
      shippingAddress,
      billingAddress,
      paymentMethod,
    }, cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price.toString(),
    })));

    // Generate QR codes for each product
    await generateOrderQRCodes(order, cartItems);

    // Send confirmation email
    await emailService.sendOrderConfirmation(order, cartItems);

    // Clear cart
    await storage.clearCart(userId);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

### Frontend Checkout Process (`client/src/pages/checkout.tsx`)

```javascript
export default function CheckoutPage() {
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      // Navigate to success page
      navigate(`/order-success?orderId=${data.id}`);
    },
  });

  const handleSubmit = async (data: any) => {
    createOrderMutation.mutate({
      shippingAddress: `${data.shippingStreet}, ${data.shippingCity}, ${data.shippingState} ${data.shippingZip}`,
      billingAddress: `${data.billingStreet}, ${data.billingCity}, ${data.billingState} ${data.billingZip}`,
      paymentMethod: data.paymentMethod,
    });
  };
}
```

## 🔲 QR Code System Implementation

### Backend QR Code Generation (`server/services/qrService.ts`)

#### QR Code Data Structure
```sql
-- QR codes table for product verification
CREATE TABLE qr_codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products(id),
  order_id INTEGER NOT NULL REFERENCES orders(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  serial_number TEXT NOT NULL,
  security_code TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### QR Code Generation Service
```javascript
class QRService {
  generateQRCode(data: QRCodeData): InsertQrCode {
    const uniqueCode = `${data.orderId}-${data.productId}-${Date.now()}`;
    const serialNumber = `SN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const securityCode = Math.random().toString(36).substr(2, 8).toUpperCase();

    return {
      code: uniqueCode,
      productId: data.productId,
      orderId: data.orderId,
      userId: data.userId,
      serialNumber,
      securityCode,
    };
  }

  async generateQRCodeDataURL(code: string): Promise<string> {
    const verificationURL = `${process.env.FRONTEND_URL}/verify?code=${code}`;
    return await QRCode.toDataURL(verificationURL, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  async generateStyledQRCode(code: string, options?: {
    color?: string;
    background?: string;
    logo?: string;
  }): Promise<string> {
    const verificationURL = `${process.env.FRONTEND_URL}/verify?code=${code}`;
    
    return await QRCode.toDataURL(verificationURL, {
      width: 300,
      margin: 3,
      color: {
        dark: options?.color || '#00ff41',
        light: options?.background || '#0a0a0a'
      },
      errorCorrectionLevel: 'M'
    });
  }
}
```

### QR Code Generation During Order Creation

```javascript
async function generateOrderQRCodes(order: Order, cartItems: CartItem[]) {
  for (const item of cartItems) {
    for (let i = 0; i < item.quantity; i++) {
      // Generate QR code data
      const qrCodeData = qrService.generateQRCode({
        orderId: order.id,
        productId: item.productId,
        userId: order.userId,
        serialNumber: `SN${Date.now()}${i}`,
      });

      // Save to database
      await storage.createQrCode(qrCodeData);

      // Update inventory unit status
      await storage.updateInventoryUnitStatus(
        qrCodeData.serialNumber,
        'sold',
        order.id
      );
    }
  }
}
```

### Email Integration with QR Codes (`server/services/emailService.ts`)

```javascript
async sendOrderConfirmation(
  order: Order, 
  items: (CartItem & { product: Product })[]
): Promise<void> {
  const orderItems: OrderItem[] = [];

  for (const item of items) {
    // Get QR codes for this product in this order
    const qrCodes = await storage.getQrCodes({
      orderId: order.id,
      productId: item.productId
    });

    for (let i = 0; i < item.quantity; i++) {
      const qrCode = qrCodes[i];
      
      // Generate QR code image
      const qrCodeImage = await qrService.generateStyledQRCode(qrCode.code);

      orderItems.push({
        productName: item.product.name,
        quantity: 1,
        price: item.product.price.toString(),
        productImage: item.product.imageUrl,
        serialNumber: qrCode.serialNumber,
        securityCodeImage: qrCodeImage, // Base64 QR code image
      });
    }
  }

  // Send email with QR codes embedded
  const emailData: OrderEmailData = {
    orderId: order.id,
    customerName: `${order.user.firstName} ${order.user.lastName}`,
    customerEmail: order.user.email,
    total: order.total,
    shippingAddress: order.shippingAddress,
    orderDate: order.createdAt.toISOString(),
    items: orderItems,
  };

  await this.transporter?.sendMail({
    from: process.env.EMAIL_USER,
    to: emailData.customerEmail,
    subject: `Order Confirmation #${emailData.orderId}`,
    html: this.generateOrderEmailHTML(emailData),
  });
}
```

### QR Code Verification System

#### Backend Verification (`server/routes.ts`)
```javascript
app.get("/api/qr-codes/:code", async (req, res) => {
  try {
    const { code } = req.params;
    
    const qrCodeData = await storage.getQrCode(code);
    if (!qrCodeData) {
      return res.status(404).json({ message: "QR code not found" });
    }

    // Mark as verified if not already
    if (!qrCodeData.isVerified) {
      await storage.verifyQrCode(code);
    }

    res.json({
      isValid: true,
      product: qrCodeData.product,
      serialNumber: qrCodeData.serialNumber,
      verificationDate: qrCodeData.verificationDate || new Date(),
      order: {
        id: qrCodeData.order.id,
        orderNumber: qrCodeData.order.orderNumber,
        date: qrCodeData.order.createdAt,
      },
      customer: {
        name: `${qrCodeData.user.firstName} ${qrCodeData.user.lastName}`,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
});
```

#### Frontend QR Scanner (`client/src/pages/qr-verify.tsx`)
```javascript
export default function QRVerifyPage() {
  const [code, setCode] = useState("");
  
  const verifyMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      const response = await apiRequest("GET", `/api/qr-codes/${qrCode}`);
      return response.json();
    },
    onSuccess: (data) => {
      // Display verification results
      setVerificationResult(data);
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Invalid or expired QR code",
        variant: "destructive",
      });
    },
  });
}
```

## 📧 Email System with QR Codes

### HTML Email Template with Embedded QR Codes

```javascript
private generateOrderEmailHTML(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .qr-code { 
          max-width: 200px; 
          border: 2px solid #00ff41; 
          border-radius: 8px; 
        }
        .security-section {
          background: #0a0a0a;
          color: #00ff41;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <h1>Order Confirmation #${data.orderId}</h1>
      
      ${data.items.map(item => `
        <div class="product-item">
          <h3>${item.productName}</h3>
          <p>Serial Number: <strong>${item.serialNumber}</strong></p>
          
          <div class="security-section">
            <h4>🔐 Product Verification QR Code</h4>
            <img src="data:image/png;base64,${item.securityCodeImage}" 
                 class="qr-code" 
                 alt="Product verification QR code" />
            <p><small>Scan this QR code to verify product authenticity</small></p>
          </div>
        </div>
      `).join('')}
      
      <p>Total: $${data.total}</p>
      <p>Shipping Address: ${data.shippingAddress}</p>
    </body>
    </html>
  `;
}
```

## 🔗 System Integration Flow

### Complete Order-to-Verification Flow

1. **User adds items to cart** → Cart stored in PostgreSQL with user session
2. **User proceeds to checkout** → Form collects shipping/billing information  
3. **Order creation triggers**:
   - Order record created in database
   - QR codes generated for each product unit
   - Inventory units marked as 'sold'
   - Email sent with embedded QR code images
   - Cart cleared
4. **Customer receives email** → Contains unique QR codes for each product
5. **Customer scans QR code** → Verification page confirms authenticity
6. **Verification updates database** → Marks QR code as verified with timestamp

### Key Security Features

- **Unique QR codes** per product unit (not per product type)
- **Serial numbers** for individual item tracking
- **Session-based authentication** with PostgreSQL storage
- **Scrypt password hashing** with random salts
- **SQL injection prevention** via Drizzle ORM parameterized queries
- **CSRF protection** through session management

### Database Relationships

```sql
-- Core relationships ensuring data integrity
users ←→ orders (one-to-many)
orders ←→ order_items (one-to-many) 
orders ←→ qr_codes (one-to-many)
products ←→ qr_codes (one-to-many)
products ←→ inventory_units (one-to-many)
```

This implementation provides a complete, secure e-commerce system with product authentication through QR codes, ensuring each purchased item can be verified for authenticity.