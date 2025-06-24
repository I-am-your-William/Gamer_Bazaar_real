import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/admin/sidebar';
import { QrCode, Search, Eye, Download } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
// Remove type import as it's not defined

export default function AdminQRManagement() {
  const { toast } = useToast();
  const { isAdminLoggedIn } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Admin access required</p>
          <Button 
            onClick={() => window.location.href = '/admin-login'}
            className="mt-4 bg-electric hover:bg-electric/80"
          >
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  const { data: qrCodes, isLoading: qrLoading } = useQuery({
    queryKey: ['/api/qr-codes'],
    enabled: isAdminLoggedIn,
  });

  const markAsVerifiedMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", `/api/verify/${code}`, {
        verifiedAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      toast({
        title: "Success",
        description: "QR code marked as verified",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to verify QR code",
        variant: "destructive",
      });
    },
  });

  // Filter QR codes based on search term
  const filteredQrCodes = qrCodes?.filter((qr: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      qr.product?.name?.toLowerCase().includes(searchLower) ||
      qr.order?.id?.toString().includes(searchLower) ||
      qr.serialNumber?.toLowerCase().includes(searchLower) ||
      qr.code?.toLowerCase().includes(searchLower)
    );
  }) || [];

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
                  {qrCodes?.filter((qr: any) => qr.isVerified).length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {qrCodes?.filter((qr: any) => !qr.isVerified).length || 0}
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
                {filteredQrCodes.map((qr: any) => (
                  <Card key={qr.id} className="gaming-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{qr.product?.name || 'Unknown Product'}</CardTitle>
                          <p className="text-gray-400">Order #{qr.order?.id || qr.orderId}</p>
                        </div>
                        <Badge className={
                          qr.isVerified ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
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
                          onClick={() => window.open(`/authenticate/${qr.code}`, '_blank')}
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