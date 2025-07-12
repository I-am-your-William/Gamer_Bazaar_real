import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  qrCodes,
  inventoryUnits,
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
  type InventoryUnit,
  type InsertInventoryUnit,
  reviews,
  reviewHelpfulVotes,
  type Review,
  type InsertReview,
  type InsertReviewHelpfulVote,
} from "@shared/schema";
// Use local PostgreSQL driver for local development
const isLocalPostgres = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');
const { db } = isLocalPostgres ? await import('./db-local') : await import('./db');
import { eq, desc, and, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
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

  // User management
  getAllUsers(): Promise<User[]>;

  // Inventory Units operations
  getInventoryUnits(filters?: { productId?: number; status?: string }): Promise<(InventoryUnit & { product: Product })[]>;
  getInventoryUnit(unitId: string): Promise<(InventoryUnit & { product: Product }) | undefined>;
  createInventoryUnit(unit: InsertInventoryUnit): Promise<InventoryUnit>;
  updateInventoryUnitStatus(unitId: string, status: string, orderId?: number): Promise<InventoryUnit>;
  generateUnitId(productId: number): Promise<string>;
  getAvailableInventoryCount(productId: number): Promise<number>;

  // Review operations
  getReviews(productId: number): Promise<(Review & { user: Pick<User, 'id' | 'firstName' | 'lastName' | 'username'> })[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: number): Promise<void>;
  voteReviewHelpful(vote: InsertReviewHelpfulVote): Promise<void>;
  getProductRatingStats(productId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
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
      .orderBy(products.createdAt, products.id)
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

  // Inventory Units operations
  async getInventoryUnits(filters: { productId?: number; status?: string } = {}): Promise<(InventoryUnit & { product: Product })[]> {
    const conditions = [];
    
    if (filters.productId) {
      conditions.push(eq(inventoryUnits.productId, filters.productId));
    }
    
    if (filters.status) {
      conditions.push(eq(inventoryUnits.status, filters.status));
    }

    return await db
      .select()
      .from(inventoryUnits)
      .leftJoin(products, eq(inventoryUnits.productId, products.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(inventoryUnits.createdAt)
      .then(results => 
        results.map(({ inventory_units, products }) => ({
          ...inventory_units,
          product: products!,
        }))
      );
  }

  async getInventoryUnit(unitId: string): Promise<(InventoryUnit & { product: Product }) | undefined> {
    const [result] = await db
      .select()
      .from(inventoryUnits)
      .leftJoin(products, eq(inventoryUnits.productId, products.id))
      .where(eq(inventoryUnits.unitId, unitId));

    if (!result) return undefined;

    return {
      ...result.inventory_units,
      product: result.products!,
    };
  }

  async createInventoryUnit(unit: InsertInventoryUnit): Promise<InventoryUnit> {
    const [newUnit] = await db.insert(inventoryUnits).values(unit).returning();
    
    // Update product stock quantity by counting available units
    const availableCount = await this.getAvailableInventoryCount(unit.productId);
    await this.updateProduct(unit.productId, { stockQuantity: availableCount });
    
    return newUnit;
  }

  async updateInventoryUnitStatus(unitId: string, status: string, orderId?: number): Promise<InventoryUnit> {
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (status === 'sold' && orderId) {
      updateData.soldAt = new Date();
      updateData.orderId = orderId;
    }

    const [updatedUnit] = await db
      .update(inventoryUnits)
      .set(updateData)
      .where(eq(inventoryUnits.unitId, unitId))
      .returning();
    
    // Update product stock quantity after status change
    const availableCount = await this.getAvailableInventoryCount(updatedUnit.productId);
    await this.updateProduct(updatedUnit.productId, { stockQuantity: availableCount });
    
    return updatedUnit;
  }

  async generateUnitId(productId: number): Promise<string> {
    const product = await this.getProduct(productId);
    if (!product) throw new Error('Product not found');

    // Use product SKU as base, or generate from name
    let prefix = product.sku || '';
    if (!prefix) {
      const words = product.name.split(' ');
      prefix = words.slice(0, 2).map(w => w.substring(0, 3)).join('').toUpperCase();
    }

    // Get count of existing units for this product to generate next number
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(inventoryUnits)
      .where(eq(inventoryUnits.productId, productId));

    const count = (countResult?.count || 0) + 1;
    return `${prefix}_${count}`;
  }

  async getAvailableInventoryCount(productId: number): Promise<number> {
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(inventoryUnits)
      .where(
        and(
          eq(inventoryUnits.productId, productId),
          eq(inventoryUnits.status, 'available')
        )
      );

    return countResult?.count || 0;
  }
  // Review operations
  async getReviews(productId: number): Promise<(Review & { user: Pick<User, 'id' | 'firstName' | 'lastName' | 'username'> })[]> {
    return await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        orderId: reviews.orderId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        helpfulCount: reviews.helpfulCount,
        isApproved: reviews.isApproved,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    // Check if user has purchased this product
    const hasOrdered = await db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.userId, reviewData.userId),
          eq(orderItems.productId, reviewData.productId),
          eq(orders.status, 'delivered')
        )
      )
      .limit(1);

    const isVerifiedPurchase = hasOrdered.length > 0;
    const orderId = hasOrdered.length > 0 ? hasOrdered[0].id : null;

    const [review] = await db
      .insert(reviews)
      .values({
        ...reviewData,
        orderId,
        isVerifiedPurchase,
      })
      .returning();

    return review;
  }

  async updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review> {
    const [review] = await db
      .update(reviews)
      .set({ ...reviewData, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  async voteReviewHelpful(vote: InsertReviewHelpfulVote): Promise<void> {
    await db.transaction(async (tx) => {
      // Insert or update vote
      await tx
        .insert(reviewHelpfulVotes)
        .values(vote)
        .onConflictDoUpdate({
          target: [reviewHelpfulVotes.reviewId, reviewHelpfulVotes.userId],
          set: { isHelpful: vote.isHelpful },
        });

      // Update helpful count
      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(reviewHelpfulVotes)
        .where(
          and(
            eq(reviewHelpfulVotes.reviewId, vote.reviewId),
            eq(reviewHelpfulVotes.isHelpful, true)
          )
        );

      await tx
        .update(reviews)
        .set({ helpfulCount: count })
        .where(eq(reviews.id, vote.reviewId));
    });
  }

  async getProductRatingStats(productId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const result = await db
      .select({
        rating: reviews.rating,
        count: sql<number>`count(*)`,
        avg: sql<number>`avg(${reviews.rating})`,
        total: sql<number>`count(*) over()`,
      })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
      .groupBy(reviews.rating);

    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let averageRating = 0;
    let totalReviews = 0;

    if (result.length > 0) {
      result.forEach((row) => {
        ratingDistribution[row.rating] = row.count;
        totalReviews = row.total || 0;
        averageRating = row.avg || 0;
      });
    }

    return {
      averageRating: averageRating ? Number(Number(averageRating).toFixed(1)) : 0,
      totalReviews: totalReviews || 0,
      ratingDistribution,
    };
  }
}

export const storage = new DatabaseStorage();
