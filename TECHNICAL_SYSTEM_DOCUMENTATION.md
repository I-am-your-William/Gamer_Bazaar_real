# Gamer Bazaar - Technical System Documentation

This document provides detailed explanations of the core systems in the gaming e-commerce platform, including authentication, backend-database cooperation, and frontend display mechanisms.

## Table of Contents
1. [Login & Registration System](#1-login--registration-system)
2. [Backend-Database Cooperation](#2-backend-database-cooperation)
3. [Frontend Display System](#3-frontend-display-system)

---

## 1. Login & Registration System

### Overview
The authentication system uses **Passport.js** with local strategy for username/password authentication, backed by **PostgreSQL sessions** for persistent login state management.

### System Architecture

```
Frontend (React) ──→ Backend (Express + Passport.js) ──→ Database (PostgreSQL)
     │                         │                              │
     │                    Session Store                   Users Table
     │                    (PostgreSQL)                   Sessions Table
     │                         │                              │
     └─────────────── Authentication State ──────────────────┘
```

### 1.1 Password Security Implementation

**Location:** `server/localAuth.ts` (lines 18-28)

```typescript
// Password hashing using scrypt with salt
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Password verification with timing-safe comparison
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
```

**Security Features:**
- **scrypt** algorithm (NIST recommended for password hashing)
- **Random salt** generation (16 bytes) for each password
- **Timing-safe comparison** prevents timing attacks
- **64-byte key derivation** for strong hash generation

### 1.2 Session Management Configuration

**Location:** `server/localAuth.ts` (lines 32-47)

```typescript
const sessionSettings: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-for-local-dev',
  resave: false,                    // Don't save unchanged sessions
  saveUninitialized: false,         // Don't save empty sessions
  cookie: {
    secure: false,                  // HTTPS only in production
    maxAge: 24 * 60 * 60 * 1000,   // 24 hours expiration
    sameSite: 'lax',               // CSRF protection
    httpOnly: false,               // Debug access (production: true)
  },
  name: 'gamer.session.id',         // Custom session cookie name
};
```

**Session Storage:** PostgreSQL table stores session data

```sql
-- Database schema (shared/schema.ts)
CREATE TABLE session (
  sid VARCHAR PRIMARY KEY,          -- Session ID
  sess JSON NOT NULL,               -- Session data
  expire TIMESTAMP NOT NULL         -- Expiration time
);
```

### 1.3 Passport.js Strategy Implementation

**Location:** `server/localAuth.ts` (lines 49-66)

```typescript
passport.use(
  new LocalStrategy(async (username, password, done) => {
    // 1. Fetch user from database
    const user = await storage.getUserByUsername(username);
    
    // 2. Verify user exists and password matches
    if (!user || !(await comparePasswords(password, user.password))) {
      return done(null, false);  // Authentication failed
    } else {
      return done(null, user);   // Authentication successful
    }
  }),
);

// Serialize user for session storage
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  const user = await storage.getUser(id);
  done(null, user);
});
```

### 1.4 Authentication API Endpoints

**Location:** `server/localAuth.ts` (lines 77-117)

#### Registration Endpoint (`POST /api/register`)
```typescript
app.post("/api/register", async (req, res, next) => {
  // 1. Check if username already exists
  const existingUser = await storage.getUserByUsername(req.body.username);
  if (existingUser) {
    return res.status(400).send("Username already exists");
  }

  // 2. Hash password and create user
  const user = await storage.createUser({
    ...req.body,
    password: await hashPassword(req.body.password),
  });

  // 3. Automatically log in the new user
  req.login(user, (err) => {
    if (err) return next(err);
    res.status(201).json(user);
  });
});
```

#### Login Endpoint (`POST /api/login`)
```typescript
app.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.status(200).json(req.user);
});
```

#### Logout Endpoint (`POST /api/logout`)
```typescript
app.post("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});
```

#### User Status Endpoint (`GET /api/user`)
```typescript
app.get("/api/user", (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  res.json(req.user);
});
```

### 1.5 Frontend Authentication Integration

**Location:** `client/src/hooks/useLocalAuth.tsx`

```typescript
// Authentication context provider
export function LocalAuthProvider({ children }: { children: ReactNode }) {
  // Query current user status
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/user"], user);
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/user"], user);
    },
  });
}
```

---

## 2. Backend-Database Cooperation

### Overview
The backend uses **Drizzle ORM** with **PostgreSQL** for type-safe database operations, implementing a storage interface pattern for clean separation of concerns.

### 2.1 Database Schema Definition

**Location:** `shared/schema.ts`

```typescript
// Users table schema
export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("customer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  categoryId: integer("category_id").references(() => categories.id),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type generation from schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
```

### 2.2 Storage Interface Pattern

**Location:** `server/storage.ts`

```typescript
// Abstract storage interface
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  
  // Product operations
  getProducts(filters?: ProductFilters): Promise<{ products: Product[]; total: number }>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  
  // Order operations
  createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order>;
}
```

### 2.3 Database Connection Management

**Location:** `server/db.ts` vs `server/db-local.ts`

**Production (Neon Serverless):**
```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Local Development (PostgreSQL Pool):**
```typescript
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});
export const db = drizzle(pool, { schema });
```

### 2.4 SQL Injection Prevention

**Method 1: Parameterized Queries**
```typescript
// Safe: Uses parameterized query via Drizzle ORM
async getUser(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

// Unsafe: Direct string concatenation (NOT USED)
// const query = `SELECT * FROM users WHERE id = '${id}'`;
```

**Method 2: Schema Validation**
```typescript
// Input validation before database operations
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Validated in API routes
app.post("/api/products", async (req, res) => {
  try {
    const validatedData = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(validatedData);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Invalid input data" });
  }
});
```

### 2.5 Complex Database Operations

**Example: Order Creation with Inventory Management**

```typescript
async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
  return await db.transaction(async (tx) => {
    // 1. Create order record
    const [newOrder] = await tx.insert(orders).values(order).returning();
    
    // 2. Process each order item
    for (const item of items) {
      // Create order item
      await tx.insert(orderItems).values({
        ...item,
        orderId: newOrder.id,
      });
      
      // Update inventory: mark units as sold
      const units = await tx
        .select()
        .from(inventoryUnits)
        .where(
          and(
            eq(inventoryUnits.productId, item.productId),
            eq(inventoryUnits.status, 'available')
          )
        )
        .limit(item.quantity);
      
      // Update unit status to 'sold'
      for (const unit of units) {
        await tx
          .update(inventoryUnits)
          .set({ 
            status: 'sold', 
            orderId: newOrder.id,
            updatedAt: new Date()
          })
          .where(eq(inventoryUnits.unitId, unit.unitId));
      }
    }
    
    return newOrder;
  });
}
```

### 2.6 API Route Implementation

**Location:** `server/routes.ts`

```typescript
export async function registerRoutes(app: Express): Promise<Server> {
  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, limit = 20, offset = 0 } = req.query;
      
      const result = await storage.getProducts({
        category: category as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Cart API (requires authentication)
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user!.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });
}
```

---

## 3. Frontend Display System

### Overview
The frontend uses **React** with **TanStack Query** for state management, **Wouter** for routing, and **Tailwind CSS** for styling. The system implements a component-based architecture with real-time data synchronization.

### 3.1 Data Fetching Architecture

**Location:** `client/src/lib/queryClient.ts`

```typescript
// Global query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey, signal }) => {
        const response = await fetch(queryKey[0] as string, { signal });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      },
    },
  },
});

// Standardized API request function
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  data?: any
): Promise<Response> {
  const config: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Include cookies for session
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
}
```

### 3.2 Product Display Implementation

**Location:** `client/src/pages/home-page.tsx`

```typescript
export default function HomePage() {
  // Fetch products with real-time updates
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products", { 
      category: selectedCategory, 
      search: searchQuery,
      limit: 20,
      offset: (currentPage - 1) * 20 
    }],
  });

  // Fetch categories for navigation
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Real-time search with debouncing
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setSearchQuery(query);
      setCurrentPage(1); // Reset pagination
    }, 300),
    []
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search gaming equipment..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Grid */}
      {productsLoading ? (
        <ProductGridSkeleton />
      ) : productsError ? (
        <ErrorState error={productsError} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsData?.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalItems={productsData?.total || 0}
        itemsPerPage={20}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

### 3.3 Component Architecture

**Product Card Component:**
```typescript
interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { user } = useLocalAuth();
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      // Invalidate cart cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-square relative overflow-hidden rounded-t-lg">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {!user && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-sm font-medium">Login to purchase</p>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          
          {user ? (
            <Button
              onClick={() => addToCartMutation.mutate(product.id)}
              disabled={addToCartMutation.isPending}
              size="sm"
            >
              {addToCartMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/auth">Login to Buy</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3.4 State Management with TanStack Query

**Cache Invalidation Strategy:**
```typescript
// Shopping cart management
const { data: cartItems = [] } = useQuery<(CartItem & { product: Product })[]>({
  queryKey: ["/api/cart"],
  enabled: !!user, // Only fetch if user is logged in
});

// Update cart item mutation
const updateCartMutation = useMutation({
  mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
    return apiRequest("PUT", `/api/cart/${itemId}`, { quantity });
  },
  onSuccess: () => {
    // Invalidate and refetch cart data
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  },
});

// Remove from cart mutation
const removeFromCartMutation = useMutation({
  mutationFn: async (itemId: number) => {
    return apiRequest("DELETE", `/api/cart/${itemId}`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    });
  },
});
```

### 3.5 Routing and Navigation

**Location:** `client/src/App.tsx`

```typescript
function Router() {
  const { user, isLoading } = useLocalAuth();
  const { isAdminLoggedIn } = useAdminAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected user routes */}
      <Route path="/cart">
        {user ? <CartPage /> : <Redirect to="/auth" />}
      </Route>
      <Route path="/checkout">
        {user ? <CheckoutPage /> : <Redirect to="/auth" />}
      </Route>
      <Route path="/orders/:orderId">
        {user ? <OrderDetailsPage /> : <Redirect to="/auth" />}
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        {isAdminLoggedIn ? <AdminDashboard /> : <AdminAuthPage />}
      </Route>
      <Route path="/admin/inventory">
        {isAdminLoggedIn ? <InventoryManagement /> : <AdminAuthPage />}
      </Route>
      
      {/* 404 handler */}
      <Route component={NotFound} />
    </Switch>
  );
}
```

### 3.6 Real-time Updates

**Optimistic Updates:**
```typescript
// Optimistic cart updates for better UX
const addToCartMutation = useMutation({
  mutationFn: async (productId: number) => {
    return apiRequest("POST", "/api/cart", { productId, quantity: 1 });
  },
  onMutate: async (productId) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["/api/cart"] });
    
    // Snapshot the previous value
    const previousCart = queryClient.getQueryData(["/api/cart"]);
    
    // Optimistically update to the new value
    queryClient.setQueryData(["/api/cart"], (old: any[]) => [
      ...old,
      { 
        id: Date.now(), // Temporary ID
        productId, 
        quantity: 1,
        product: products.find(p => p.id === productId)
      }
    ]);
    
    return { previousCart };
  },
  onError: (err, productId, context) => {
    // Rollback on error
    queryClient.setQueryData(["/api/cart"], context?.previousCart);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  },
});
```

### 3.7 Error Handling and Loading States

**Global Error Boundary:**
```typescript
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </div>
    </div>
  );
}

// Usage in App.tsx
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <QueryClientProvider client={queryClient}>
    <LocalAuthProvider>
      <AdminAuthProvider>
        <Router />
      </AdminAuthProvider>
    </LocalAuthProvider>
  </QueryClientProvider>
</ErrorBoundary>
```

This comprehensive documentation covers the complete technical implementation of the authentication system, backend-database cooperation, and frontend display mechanisms in the gaming e-commerce platform. Each section provides detailed code examples and explanations of the underlying architecture and design decisions.