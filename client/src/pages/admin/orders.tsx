import { useQuery, useMutation } from '@tanstack/react-query';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ORDER_STATUSES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Package, User, MapPin, Calendar, DollarSign, Search, Filter } from 'lucide-react';

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

export default function AdminOrders() {
  const { isAdminLoggedIn } = useAdminAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAdminLoggedIn) {
    navigate('/admin');
    return null;
  }

  // Fetch all orders (admin can see all orders)
  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const res = await fetch('/api/admin/orders', {
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch orders');
      }
      
      return await res.json();
    },
    enabled: isAdminLoggedIn,
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update order status');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

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

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) ||
      order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">
          Manage and track all customer orders
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, user, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' || searchTerm 
                  ? 'No orders match your current filters.' 
                  : 'No orders have been placed yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {order.userId}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${order.total}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(order.status) as any}>
                      {getStatusLabel(order.status)}
                    </Badge>
                    <Select
                      value={order.status}
                      onValueChange={(newStatus) => 
                        updateOrderStatusMutation.mutate({ orderId: order.id, status: newStatus })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3">Items ({order.orderItems.length})</h4>
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            {item.product.imageUrl ? (
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-muted-foreground">
                              Qty: {item.quantity} × ${item.price}
                            </p>
                          </div>
                          <p className="font-medium">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Shipping Information
                    </h4>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-muted-foreground">Address:</span>
                        <p>{order.shippingAddress}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment Method:</span>
                        <p className="capitalize">{order.paymentMethod.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Updated:</span>
                        <p>{new Date(order.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}