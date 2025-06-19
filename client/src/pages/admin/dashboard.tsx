import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import AdminSidebar from '@/components/admin/sidebar';
import { TrendingUp, Package, ShoppingCart, QrCode, Users, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: qrCodes } = useQuery({
    queryKey: ['/api/qr-codes'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const recentOrders = orders?.slice(0, 5) || [];
  const recentQrCodes = qrCodes?.slice(0, 5) || [];

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
              ADMIN <span className="text-electric">DASHBOARD</span>
            </h1>
            <p className="text-gray-400">Overview of your gaming equipment store</p>
          </div>

          {/* Analytics Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="gaming-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-neon-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neon-green">
                  ${analyticsLoading ? '---' : analytics?.todaySales?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-gray-400">
                  +12% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-electric" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-electric">
                  ${analyticsLoading ? '---' : analytics?.monthlySales?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-gray-400">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-gaming-purple" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gaming-purple">
                  {analyticsLoading ? '---' : analytics?.totalOrders || '0'}
                </div>
                <p className="text-xs text-gray-400">
                  +23 new orders
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-gaming-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gaming-orange">
                  {analyticsLoading ? '---' : analytics?.totalProducts || '0'}
                </div>
                <p className="text-xs text-gray-400">
                  Active products
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <Card className="gaming-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-electric" />
                    Recent Orders
                  </span>
                  <Link href="/admin/orders">
                    <Button variant="outline" size="sm" className="border-electric text-electric">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-deep-black rounded-lg">
                        <div>
                          <p className="font-semibold">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neon-green">${order.totalAmount}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === 'delivered' ? 'bg-neon-green text-deep-black' :
                            order.status === 'shipped' ? 'bg-gaming-purple text-white' :
                            order.status === 'processing' ? 'bg-electric text-deep-black' :
                            'bg-gaming-orange text-white'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2 text-neon-green" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/inventory">
                  <Button variant="outline" className="w-full justify-start border-electric text-electric hover:bg-electric hover:text-deep-black">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Inventory
                  </Button>
                </Link>
                
                <Link href="/admin/orders">
                  <Button variant="outline" className="w-full justify-start border-neon-green text-neon-green hover:bg-neon-green hover:text-deep-black">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Process Orders
                  </Button>
                </Link>
                
                <Link href="/admin/qr-management">
                  <Button variant="outline" className="w-full justify-start border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Management
                  </Button>
                </Link>

                <div className="pt-4 border-t border-electric/20">
                  <h4 className="font-semibold mb-3">QR Verification Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Generated:</span>
                      <span className="text-gaming-purple font-semibold">
                        {qrCodes?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Verified:</span>
                      <span className="text-neon-green font-semibold">
                        {qrCodes?.filter((qr: any) => qr.isVerified).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pending:</span>
                      <span className="text-gaming-orange font-semibold">
                        {qrCodes?.filter((qr: any) => !qr.isVerified).length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
