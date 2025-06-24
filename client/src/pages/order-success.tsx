import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Mail, ArrowRight, Home, Receipt, Shield } from 'lucide-react';

interface Order {
  id: number;
  userId: string;
  status: string;
  total: string;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: Array<{
    id: number;
    productId: number;
    quantity: number;
    price: string;
    product: {
      id: number;
      name: string;
      imageUrl?: string;
    };
  }>;
}

export default function OrderSuccess() {
  const params = useParams();
  const orderId = params.id;
  const { user } = useLocalAuth();
  const [, navigate] = useLocation();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['/api/orders', orderId],
    enabled: !!orderId && !!user,
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find the order you're looking for.
            </p>
            <Button onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = order?.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-muted-foreground text-lg">
          Thank you for your purchase. Your gaming gear is on the way!
        </p>
      </div>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order #{order.id}
              </CardTitle>
              <CardDescription>
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Payment Confirmed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Order Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">${order.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items:</span>
                  <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="capitalize">{order.paymentMethod?.replace('-', ' ') || 'Credit Card'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Shipping Address</h4>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Gaming Equipment</CardTitle>
          <CardDescription>Items in this order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(order.orderItems || []).map((item, index) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  {item.product.imageUrl ? (
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity} × ${item.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No items found in this order</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium mb-2">Email Confirmation</h4>
              <p className="text-sm text-muted-foreground">
                Check your email for order confirmation with serial numbers and QR codes
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium mb-2">Order Processing</h4>
              <p className="text-sm text-muted-foreground">
                We'll prepare your gaming equipment for shipping
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium mb-2">Product Verification</h4>
              <p className="text-sm text-muted-foreground">
                Use QR codes to verify authenticity when products arrive
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => navigate(`/orders/${order.id}`)} className="flex-1 sm:flex-none">
          <Receipt className="h-4 w-4 mr-2" />
          Track Order
        </Button>
        <Button variant="outline" onClick={() => navigate('/')} className="flex-1 sm:flex-none">
          <Home className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
        <Button variant="outline" onClick={() => navigate('/orders')} className="flex-1 sm:flex-none">
          <ArrowRight className="h-4 w-4 mr-2" />
          View All Orders
        </Button>
      </div>

      {/* Support Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Questions about your order? Contact us at support@gamerbazaar.com
        </p>
      </div>
    </div>
  );
}