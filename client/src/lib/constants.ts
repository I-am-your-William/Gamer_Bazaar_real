export const PRODUCT_CATEGORIES = [
  { id: 'gaming-pcs', name: 'Gaming PCs', icon: '🖥️' },
  { id: 'laptops', name: 'Gaming Laptops', icon: '💻' },
  { id: 'keyboards', name: 'Keyboards', icon: '⌨️' },
  { id: 'mice', name: 'Gaming Mice', icon: '🖱️' },
  { id: 'headsets', name: 'Headsets', icon: '🎧' },
  { id: 'monitors', name: 'Monitors', icon: '🖥️' },
  { id: 'components', name: 'Components', icon: '🔧' },
  { id: 'accessories', name: 'Accessories', icon: '🎮' },
];

export const ORDER_STATUSES = [
  { id: 'pending', name: 'Pending', color: 'text-yellow-500' },
  { id: 'processing', name: 'Processing', color: 'text-blue-500' },
  { id: 'shipped', name: 'Shipped', color: 'text-purple-500' },
  { id: 'delivered', name: 'Delivered', color: 'text-green-500' },
  { id: 'cancelled', name: 'Cancelled', color: 'text-red-500' },
];

export const PAYMENT_METHODS = [
  { id: 'credit_card', name: 'Credit Card', icon: '💳' },
  { id: 'paypal', name: 'PayPal', icon: '🅿️' },
  { id: 'apple_pay', name: 'Apple Pay', icon: '🍎' },
  { id: 'google_pay', name: 'Google Pay', icon: '🔵' },
];

export const BRANDS = [
  'ASUS', 'MSI', 'Corsair', 'Razer', 'Logitech', 'SteelSeries', 
  'HyperX', 'Alienware', 'NVIDIA', 'AMD', 'Intel', 'Cooler Master'
];

export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3';

export const QR_CODE_BASE_URL = process.env.NODE_ENV === 'production' 
  ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}` 
  : 'http://localhost:5000';
