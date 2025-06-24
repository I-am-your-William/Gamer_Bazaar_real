import { useQuery } from '@tanstack/react-query';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ORDER_STATUSES } from '@/lib/constants';
import { Package, Eye, ShoppingBag, Loader2 } from 'lucide-react';

interface Order {
  id: number;
  userId: string;
  status: string;
  total: string;
  shippingAddress: string;
  createdAt: string;
  orderItems: Array<{
    id: number;
    productId: number;
    quantity: number;
    product: {
      name: string;
      imageUrl?: string;
    };
  }>;
}

export default function Orders() {
  const { user } = useLocalAuth();
  const [, navigate] = useLocation();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

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

  const getStatusLabel = (status: string) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj?.label || status;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
          <p className="text-muted-foreground">Track and manage your gaming equipment orders</p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">
              Start shopping for gaming equipment to see your orders here!
            </p>
            <Button onClick={() => navigate('/')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
        <p className="text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <CardDescription>
                    Placed on {new Date(order.createdAt).toLocaleDateString()} • 
                    {' '}{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Badge variant={getStatusVariant(order.status) as any}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items Preview */}
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.orderItems.slice(0, 3).map((item, index) => (
                      <div key={item.id} className="w-12 h-12 bg-muted rounded-lg border-2 border-background flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <div className="w-12 h-12 bg-muted rounded-lg border-2 border-background flex items-center justify-center">
                        <span className="text-xs font-medium">+{order.orderItems.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {order.orderItems[0]?.product.name}
                      {order.orderItems.length > 1 && ` and ${order.orderItems.length - 1} more item${order.orderItems.length > 2 ? 's' : ''}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total: ${order.total}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  
                  {order.status === 'delivered' && (
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  )}
                  
                  {(order.status === 'pending' || order.status === 'paid') && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}