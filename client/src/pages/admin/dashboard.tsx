import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, QrCode, ShoppingCart, Users, LogOut, Home } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminDashboard() {
  const { adminLogout } = useAdminAuth();

  const handleLogout = () => {
    adminLogout();
    window.location.href = '/';
  };

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
              <div className="text-2xl font-bold text-white">245</div>
              <p className="text-xs text-gray-400">+20% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">QR Codes</CardTitle>
              <QrCode className="h-4 w-4 text-electric" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1,234</div>
              <p className="text-xs text-gray-400">+5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gaming-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">89</div>
              <p className="text-xs text-gray-400">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-electric" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">2,345</div>
              <p className="text-xs text-gray-400">+8% from last month</p>
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
              <CardTitle className="text-white">QR Code Management</CardTitle>
              <CardDescription className="text-gray-400">
                Generate and verify QR codes for products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/qr-management">
                <Button className="w-full bg-electric hover:bg-electric/80">
                  Manage QR Codes
                </Button>
              </Link>
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