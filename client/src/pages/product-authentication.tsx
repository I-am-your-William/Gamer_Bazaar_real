import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Package, Calendar, User, Download, Shield } from 'lucide-react';

export default function ProductAuthentication() {
  const { code } = useParams<{ code: string }>();
  
  const { data: authData, isLoading, error } = useQuery({
    queryKey: [`/api/authenticate/${code}`],
    enabled: !!code,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center text-white">
        <div className="animate-spin h-12 w-12 border-4 border-electric border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !authData) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center text-white">
        <Card className="gaming-card max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Authentication Failed</h3>
            <p className="text-gray-400 text-center">
              The authentication code is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { product, order, user, unit, isVerified, isActive } = authData;

  return (
    <div className="min-h-screen bg-deep-black text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-orbitron font-bold text-4xl mb-2">
            PRODUCT <span className="text-electric">AUTHENTICATION</span>
          </h1>
          <p className="text-gray-400">Verify the authenticity of your gaming equipment</p>
        </div>

        {/* Authentication Status */}
        <Alert className={`mb-6 ${isActive && isVerified ? 'border-green-500' : isActive ? 'border-yellow-500' : 'border-red-500'}`}>
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {isActive && isVerified ? 'Product is verified and authentic' : 
               isActive ? 'Product is authentic but not yet verified' : 
               'Product authentication is no longer active'}
            </span>
            <Badge className={
              isActive && isVerified ? 'bg-green-500 text-white' : 
              isActive ? 'bg-yellow-500 text-black' : 
              'bg-red-500 text-white'
            }>
              {isActive && isVerified ? 'Verified' : isActive ? 'Pending' : 'Inactive'}
            </Badge>
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Product Information */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product?.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="text-sm text-gray-400">Product Name</p>
                <p className="font-semibold">{product?.name || 'Unknown Product'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Brand</p>
                <p className="font-semibold">{product?.brand || 'Unknown Brand'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Serial Number</p>
                <p className="font-mono text-sm">{unit?.serialNumber || authData.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Authentication Code</p>
                <p className="font-mono text-sm break-all">{code}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Order ID</p>
                <p className="font-semibold">#{order?.id || authData.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Order Date</p>
                <p className="font-semibold">
                  {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Customer</p>
                <p className="font-semibold">
                  {user?.firstName && user?.lastName ? 
                    `${user.firstName} ${user.lastName}` : 
                    user?.username || 'Unknown Customer'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Verification Status</p>
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span>{isVerified ? 'Verified' : 'Not Verified'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Features */}
        <Card className="gaming-card mb-6">
          <CardHeader>
            <CardTitle>Security Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Security Code Image */}
              {unit?.securityCodeImage && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Security Code</p>
                  <img
                    src={unit.securityCodeImage}
                    alt="Security Code"
                    className="w-full max-w-sm h-32 object-contain bg-white rounded p-2"
                  />
                </div>
              )}

              {/* Certificate Download */}
              {unit?.certificateUrl && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Product Certificate</p>
                  <Button
                    onClick={() => window.open(unit.certificateUrl, '_blank')}
                    className="bg-electric hover:bg-electric/80 text-deep-black"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-electric text-electric hover:bg-electric hover:text-deep-black"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}