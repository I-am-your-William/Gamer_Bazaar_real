import { Product, Order, QrCode, User, Category } from '@shared/schema';

export interface CartItemWithProduct {
  id: number;
  userId: string;
  productId: number;
  quantity: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  product: Product;
}

export interface OrderWithItems extends Order {
  orderItems: (OrderItemWithProduct)[];
}

export interface OrderItemWithProduct {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  productName: string;
  productImage: string | null;
  product: Product;
}

export interface QrCodeWithDetails extends QrCode {
  product: Product;
  order: Order;
  user?: User;
}

export interface VerificationResult {
  verified: boolean;
  product: Product;
  order: Order;
  serialNumber: string;
  verifiedAt: Date | null;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

export interface SalesAnalytics {
  todaySales: number;
  monthlySales: number;
  totalOrders: number;
  totalProducts: number;
}

export interface CheckoutFormData {
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
}
