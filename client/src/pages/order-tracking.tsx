import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ORDER_STATUSES } from '@/lib/constants';
import { CheckCircle, Circle, Package, Truck, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface Order {
  id: number;
  userId: string;
  status: string;
  total: string;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
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

export default function OrderTracking() {
  const params = useParams();
  const orderId = params.id;
  const { user } = useLocalAuth();
  const [, navigate] = useLocation();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId && !!user,
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    },
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find the order you're looking for.
            </p>
            <Button onClick={() => navigate('/orders')}>
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIndex = (status: string) => {
    return ORDER_STATUSES.findIndex(s => s.value === status);
  };

  const currentStatusIndex = getStatusIndex(order.status);
  const currentStatus = ORDER_STATUSES.find(s => s.value === order.status);

  const getStatusIcon = (index: number) => {
    if (index <= currentStatusIndex) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
    return <Circle className="h-6 w-6 text-muted-foreground" />;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'paid': return 'default';
      case 'processing': return 'default';
      case 'shipped': return 'default';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/orders')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={getStatusVariant(order.status) as any} className="text-sm px-3 py-1">
            {currentStatus?.label || order.status}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Progress */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Progress
              </CardTitle>
              <CardDescription>Track your order status in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ORDER_STATUSES.map((status, index) => (
                  <div key={status.value} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      {getStatusIcon(index)}
                      {index < ORDER_STATUSES.length - 1 && (
                        <div 
                          className={`w-0.5 h-12 mt-2 ${
                            index < currentStatusIndex ? 'bg-green-600' : 'bg-muted-foreground/30'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${
                          index <= currentStatusIndex ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {status.label}
                        </h4>
                        {index === currentStatusIndex && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <p className={`text-sm ${
                        index <= currentStatusIndex ? 'text-muted-foreground' : 'text-muted-foreground/60'
                      }`}>
                        {status.description}
                      </p>
                      {index === currentStatusIndex && (
                        <p className="text-xs text-blue-600 mt-1">
                          Updated {new Date(order.updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{order.orderItems.length} item(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Order Total</span>
                  <span className="font-bold">${order.total}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Payment Method</span>
                  <span className="capitalize">{order.paymentMethod.replace('-', ' ')}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h4>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Estimated Delivery
                </h4>
                <p className="text-sm text-muted-foreground">
                  {order.status === 'delivered' 
                    ? 'Delivered' 
                    : order.status === 'shipped'
                    ? '2-3 business days'
                    : order.status === 'processing'
                    ? '3-5 business days'
                    : '5-7 business days'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Questions about your order? Our support team is here to help.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}