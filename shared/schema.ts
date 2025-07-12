import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  password: varchar("password"),
  role: varchar("role").default("customer"), // customer, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  sku: varchar("sku", { length: 100 }).unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  imageUrl: varchar("image_url"),
  imageUrls: text("image_urls").array(),
  categoryId: integer("category_id").references(() => categories.id),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  specifications: jsonb("specifications"),
  stockQuantity: integer("stock_quantity").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual Inventory Units - Each physical item tracked separately
export const inventoryUnits = pgTable("inventory_units", {
  id: serial("id").primaryKey(),
  unitId: varchar("unit_id", { length: 100 }).notNull().unique(), // Auto-generated like HPOmen16_1
  productId: integer("product_id").references(() => products.id).notNull(),
  serialNumber: varchar("serial_number", { length: 255 }).notNull().unique(),
  securityCodeImageUrl: varchar("security_code_image_url"), // URL to uploaded security code image
  status: varchar("status", { length: 50 }).default("available"), // available, sold, reserved
  soldAt: timestamp("sold_at"),
  orderId: integer("order_id").references(() => orders.id),
  createdBy: varchar("created_by").notNull(), // Admin who added this unit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shopping cart
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, processing, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productImage: varchar("product_image"),
});

// QR codes for product verification
export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  code: uuid("code").defaultRandom().notNull().unique(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }).notNull(),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  verificationData: jsonb("verification_data"),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product reviews and ratings
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  orderId: integer("order_id").references(() => orders.id), // Only verified purchases can review
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  isApproved: boolean("is_approved").default(true), // For moderation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Review helpfulness votes
export const reviewHelpfulVotes = pgTable("review_helpful_votes", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => reviews.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  isHelpful: boolean("is_helpful").notNull(), // true for helpful, false for not helpful
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserReview: unique().on(table.reviewId, table.userId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  orders: many(orders),
  qrCodes: many(qrCodes),
  reviews: many(reviews),
  reviewHelpfulVotes: many(reviewHelpfulVotes),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  qrCodes: many(qrCodes),
  reviews: many(reviews),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  qrCodes: many(qrCodes),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const qrCodesRelations = relations(qrCodes, ({ one }) => ({
  order: one(orders, {
    fields: [qrCodes.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [qrCodes.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [qrCodes.userId],
    references: [users.id],
  }),
}));

export const inventoryUnitsRelations = relations(inventoryUnits, ({ one }) => ({
  product: one(products, {
    fields: [inventoryUnits.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [inventoryUnits.orderId],
    references: [orders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  helpfulVotes: many(reviewHelpfulVotes),
}));

export const reviewHelpfulVotesRelations = relations(reviewHelpfulVotes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewHelpfulVotes.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewHelpfulVotes.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  createdAt: true,
});

export const insertInventoryUnitSchema = createInsertSchema(inventoryUnits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpfulCount: true,
  isApproved: true,
});

export const insertReviewHelpfulVoteSchema = createInsertSchema(reviewHelpfulVotes).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type InventoryUnit = typeof inventoryUnits.$inferSelect;
export type InsertInventoryUnit = z.infer<typeof insertInventoryUnitSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type ReviewHelpfulVote = typeof reviewHelpfulVotes.$inferSelect;
export type InsertReviewHelpfulVote = z.infer<typeof insertReviewHelpfulVoteSchema>;
