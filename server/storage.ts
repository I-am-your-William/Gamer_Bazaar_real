import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  qrCodes,
  inventoryItems,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type QrCode,
  type InsertQrCode,
  type InventoryItem,
  type InsertInventoryItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Product operations
  getProducts(filters?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // QR Code operations
  getQrCodes(filters?: { orderId?: number; userId?: string }): Promise<(QrCode & { product: Product; order: Order })[]>;
  getQrCode(code: string): Promise<(QrCode & { product: Product; order: Order; user: User }) | undefined>;
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  verifyQrCode(code: string, verificationData?: any): Promise<QrCode>;

  // Analytics
  getSalesAnalytics(): Promise<{
    todaySales: number;
    monthlySales: number;
    totalOrders: number;
    totalProducts: number;
  }>;

  // Inventory Items operations
  getInventoryItems(filters?: { productId?: number; status?: string }): Promise<(InventoryItem & { product: Product })[]>;
  getInventoryItem(uuid: string): Promise<(InventoryItem & { product: Product }) | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItemStatus(uuid: string, status: string, orderId?: number): Promise<InventoryItem>;
  generateInventoryUUID(productId: number): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(filters: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ products: Product[]; total: number }> {
    const { category, search, limit = 20, offset = 0 } = filters;

    let query = db
      .select()
      .from(products)
      .where(eq(products.isActive, true));

    let conditions = [eq(products.isActive, true)];

    if (category) {
      const categoryRecord = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, category));
      
      if (categoryRecord[0]) {
        conditions.push(eq(products.categoryId, categoryRecord[0].id));
      }
    }

    if (search) {
      conditions.push(
        ilike(products.name, `%${search}%`)
      );
    }

    const productsQuery = db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(products.id)
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions));

    const [productResults, countResults] = await Promise.all([
      productsQuery,
      countQuery,
    ]);

    return {
      products: productResults,
      total: countResults[0]?.count || 0,
    };
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    console.log('Storage updateProduct called with:', { id, product });
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    console.log('Storage updateProduct result:', updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .then(results => 
        results.map(({ cart_items, products }) => ({
          ...cart_items,
          product: products!,
        }))
      );
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + cartItem.quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    const ordersQuery = userId
      ? db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
      : db.select().from(orders).orderBy(desc(orders.createdAt));

    const orderResults = await ordersQuery;

    const ordersWithItems = await Promise.all(
      orderResults.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id))
          .then(results =>
            results.map(({ order_items, products }) => ({
              ...order_items,
              product: products!,
            }))
          );

        return {
          ...order,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }

  async getOrder(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id))
      .then(results =>
        results.map(({ order_items, products }) => ({
          ...order_items,
          product: products!,
        }))
      );

    return {
      ...order,
      orderItems: items,
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      const itemsWithOrderId = items.map(item => ({
        ...item,
        orderId: newOrder.id,
      }));

      await tx.insert(orderItems).values(itemsWithOrderId);
      
      return newOrder;
    });
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // QR Code operations
  async getQrCodes(filters: { orderId?: number; userId?: string } = {}): Promise<(QrCode & { product: Product; order: Order })[]> {
    let conditions = [];
    
    if (filters.orderId) {
      conditions.push(eq(qrCodes.orderId, filters.orderId));
    }
    
    if (filters.userId) {
      conditions.push(eq(qrCodes.userId, filters.userId));
    }

    const query = db
      .select()
      .from(qrCodes)
      .leftJoin(products, eq(qrCodes.productId, products.id))
      .leftJoin(orders, eq(qrCodes.orderId, orders.id))
      .orderBy(desc(qrCodes.createdAt));

    if (conditions.length > 0) {
      return await query
        .where(and(...conditions))
        .then(results =>
          results.map(({ qr_codes, products, orders }) => ({
            ...qr_codes,
            product: products!,
            order: orders!,
          }))
        );
    }

    return await query.then(results =>
      results.map(({ qr_codes, products, orders }) => ({
        ...qr_codes,
        product: products!,
        order: orders!,
      }))
    );
  }

  async getQrCode(code: string): Promise<(QrCode & { product: Product; order: Order; user: User }) | undefined> {
    const [result] = await db
      .select()
      .from(qrCodes)
      .leftJoin(products, eq(qrCodes.productId, products.id))
      .leftJoin(orders, eq(qrCodes.orderId, orders.id))
      .leftJoin(users, eq(qrCodes.userId, users.id))
      .where(eq(qrCodes.code, code));

    if (!result) return undefined;

    return {
      ...result.qr_codes,
      product: result.products!,
      order: result.orders!,
      user: result.users!,
    };
  }

  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const [newQrCode] = await db.insert(qrCodes).values(qrCode).returning();
    return newQrCode;
  }

  async verifyQrCode(code: string, verificationData?: any): Promise<QrCode> {
    const [verifiedQrCode] = await db
      .update(qrCodes)
      .set({
        isVerified: true,
        verifiedAt: new Date(),
        verificationData,
      })
      .where(eq(qrCodes.code, code))
      .returning();
    return verifiedQrCode;
  }

  // Analytics
  async getSalesAnalytics(): Promise<{
    todaySales: number;
    monthlySales: number;
    totalOrders: number;
    totalProducts: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [todaySalesResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${today}`);

    const [monthlySalesResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${thisMonth}`);

    const [totalOrdersResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(orders);

    const [totalProductsResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(products)
      .where(eq(products.isActive, true));

    return {
      todaySales: Number(todaySalesResult.total) || 0,
      monthlySales: Number(monthlySalesResult.total) || 0,
      totalOrders: Number(totalOrdersResult.count) || 0,
      totalProducts: Number(totalProductsResult.count) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
