import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/admin/sidebar';
import { QrCode, Search, Eye, Download } from 'lucide-react';
import type { QrCodeWithDetails } from '@/lib/types';

export default function AdminQRManagement() {
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

  const { data: qrCodes, isLoading: qrLoading } = useQuery({
    queryKey: ['/api/qr-codes'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const filteredQrCodes = qrCodes?.filter((qr: QrCodeWithDetails) =>
    qr.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
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
              QR CODE <span className="text-electric">MANAGEMENT</span>
            </h1>
            <p className="text-gray-400">Track and manage product authentication codes</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="gaming-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-electric">
                  {qrCodes?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neon-green">
                  {qrCodes?.filter((qr: QrCodeWithDetails) => qr.isVerified).length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gaming-orange">
                  {qrCodes?.filter((qr: QrCodeWithDetails) => !qr.isVerified).length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by product, order number, or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-deep-black border-electric text-white"
            />
          </div>

          {/* QR Codes List */}
          <div className="space-y-6">
            {qrLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-electric border-t-transparent rounded-full"></div>
              </div>
            ) : filteredQrCodes.length > 0 ? (
              <div className="grid gap-6">
                {filteredQrCodes.map((qr: QrCodeWithDetails) => (
                  <Card key={qr.id} className="gaming-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{qr.product.name}</CardTitle>
                          <p className="text-gray-400">Order #{qr.order.orderNumber}</p>
                        </div>
                        <Badge className={
                          qr.isVerified ? 'bg-neon-green text-deep-black' : 'bg-gaming-orange text-white'
                        }>
                          {qr.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Serial Number</p>
                          <p className="font-mono text-sm">{qr.serialNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Generated</p>
                          <p className="text-sm">{new Date(qr.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Verification</p>
                          <p className="text-sm">
                            {qr.verifiedAt ? new Date(qr.verifiedAt).toLocaleDateString() : 'Not verified'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-electric text-electric hover:bg-electric hover:text-deep-black"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View QR Code
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-neon-green text-neon-green hover:bg-neon-green hover:text-deep-black"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="gaming-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <QrCode className="h-16 w-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No QR Codes Found</h3>
                  <p className="text-gray-400 text-center">
                    {searchTerm ? 'No QR codes match your search criteria.' : 'QR codes will appear here when orders are placed.'}
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