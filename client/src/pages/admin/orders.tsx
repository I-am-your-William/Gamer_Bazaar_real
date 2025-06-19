import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/admin/sidebar';
import { ShoppingCart, Search, Eye, Package } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { OrderWithItems } from '@/lib/types';

export default function AdminOrders() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin access required.",
        variant: "destructive",
      });
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      await apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders?.filter((order: OrderWithItems) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-electric border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="font-orbitron font-bold text-4xl mb-2">
              ORDER <span className="text-electric">MANAGEMENT</span>
            </h1>
            <p className="text-gray-400">Process and track customer orders</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders by number or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-deep-black border-electric text-white"
            />
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-electric border-t-transparent rounded-full"></div>
              </div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order: OrderWithItems) => (
                <Card key={order.id} className="gaming-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">#{order.orderNumber}</CardTitle>
                        <p className="text-gray-400">{order.customerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neon-green text-xl">${order.totalAmount}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${
                        order.status === 'delivered' ? 'bg-neon-green text-deep-black' :
                        order.status === 'shipped' ? 'bg-gaming-purple text-white' :
                        order.status === 'processing' ? 'bg-electric text-deep-black' :
                        'bg-gaming-orange text-white'
                      }`}>
                        {order.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-electric text-electric hover:bg-electric hover:text-deep-black"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {order.status !== 'delivered' && (
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatusMutation.mutate({
                              orderId: order.id,
                              status: e.target.value
                            })}
                            className="bg-deep-black border border-electric text-white px-3 py-1 rounded text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-electric/20 pt-4">
                      <h4 className="font-semibold mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.orderItems?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{item.productName} x{item.quantity}</span>
                            <span className="text-neon-green">${item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="gaming-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
                  <p className="text-gray-400 text-center">
                    {searchTerm ? 'No orders match your search criteria.' : 'No orders have been placed yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}