import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, ShoppingCart, Users, LogOut, Home, BarChart3, DollarSign } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const { adminLogout } = useAdminAuth();

  const handleLogout = () => {
    adminLogout();
    window.location.href = '/';
  };

  // Fetch real analytics data
  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/analytics'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/admin/orders'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Calculate real stats
  const totalProducts = products?.total || 0;
  const totalUsers = users?.length || 0;
  const activeOrders = orders?.filter((order: any) => order.status === 'processing' || order.status === 'shipped').length || 0;
  const totalRevenue = orders?.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount), 0) || 0;

  // Prepare chart data
  const orderStatusData = orders?.reduce((acc: any, order: any) => {
    const status = order.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  const statusChartData = Object.entries(orderStatusData).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count as number,
    color: status === 'delivered' ? '#10B981' : 
           status === 'shipped' ? '#8B5CF6' :
           status === 'processing' ? '#F59E0B' : '#EF4444'
  }));

  // Recent daily orders for bar chart
  const dailyOrdersData = orders?.reduce((acc: any, order: any) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {}) || {};

  const recentOrdersChart = Object.entries(dailyOrdersData)
    .slice(-7)
    .map(([date, count]) => ({
      date,
      orders: count as number
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your gaming equipment store</p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Homepage
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Products</CardTitle>
              <Package className="h-4 w-4 text-gaming-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalProducts}</div>
              <p className="text-xs text-gray-400">Active in catalog</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-electric" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-400">From all orders</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gaming-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeOrders}</div>
              <p className="text-xs text-gray-400">Processing & shipped</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-electric" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalUsers}</div>
              <p className="text-xs text-gray-400">Registered customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-electric" />
                Recent Orders Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recentOrdersChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-gaming-orange" />
                Order Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Inventory Management</CardTitle>
              <CardDescription className="text-gray-400">
                Manage product stock levels and quantities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/inventory">
                <Button className="w-full bg-sky-400 hover:bg-sky-500 text-white">
                  Manage Inventory
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Sales Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                View detailed sales reports and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Average Order Value</span>
                  <span className="text-lg font-bold text-electric">
                    ${orders?.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Orders</span>
                  <span className="text-lg font-bold text-neon-green">{orders?.length || 0}</span>
                </div>
                <Button className="w-full bg-gaming-purple hover:bg-gaming-purple/80">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Order Management</CardTitle>
              <CardDescription className="text-gray-400">
                View and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/orders">
                <Button className="w-full bg-gray-600 hover:bg-gray-500">
                  Manage Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}