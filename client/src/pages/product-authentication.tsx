import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Shield, FileText, Package, Download, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

interface ProductAuthentication {
  id: number;
  code: string;
  productId: number;
  orderId: number;
  userId: string;
  unitId: string;
  serialNumber: string;
  isVerified: boolean;
  verifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
  product: {
    id: number;
    name: string;
    brand: string;
    imageUrl?: string;
    description: string;
    price: string;
  };
  order: {
    id: number;
    orderNumber: string;
    createdAt: string;
  };
  user: {
    id: string;
    username: string;
    email: string;
  };
  unit: {
    unitId: string;
    serialNumber: string;
    certificateUrl?: string;
    securityCodeImage?: string;
  };
}

export default function ProductAuthentication() {
  const params = useParams();
  const code = params.code;
  const [, navigate] = useLocation();

  const { data: auth, isLoading, error } = useQuery<ProductAuthentication>({
    queryKey: [`/api/authenticate/${code}`],
    enabled: !!code,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-700 rounded w-1/3"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !auth) {
    return (
      <div className="min-h-screen bg-deep-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="gaming-card">
              <CardContent className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto mb-4 text-red-400" />
                <h2 className="text-2xl font-bold mb-2 text-red-400">Authentication Failed</h2>
                <p className="text-gray-300 mb-4">
                  Invalid or expired authentication code.
                </p>
                <Button onClick={() => navigate('/')} className="bg-electric hover:bg-electric/80">
                  Return Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleDownloadCertificate = () => {
    if (auth.unit.certificateUrl) {
      window.open(auth.unit.certificateUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-4 mb-4">
              <Shield className="h-8 w-8 text-electric" />
              <div>
                <h1 className="font-orbitron font-bold text-3xl text-electric">
                  Product Authentication
                </h1>
                <p className="text-gray-300">
                  Verify the authenticity of your gaming equipment
                </p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <Badge variant="success" className="text-green-400 border-green-400">
                AUTHENTIC PRODUCT
              </Badge>
              {auth.isActive && (
                <Badge variant="default" className="text-electric border-electric">
                  QR CODE ACTIVE
                </Badge>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Information */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-electric">Product Details</CardTitle>
                <CardDescription>Verified gaming equipment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Image */}
                {auth.product.imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={auth.product.imageUrl} 
                      alt={auth.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-xl text-white mb-2">{auth.product.name}</h3>
                    <p className="text-gray-300">{auth.product.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Brand</p>
                      <p className="font-semibold text-white">{auth.product.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="font-semibold text-electric">${auth.product.price}</p>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Serial Number</p>
                      <p className="font-mono text-white">{auth.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Unit ID</p>
                      <p className="font-mono text-white">{auth.unitId}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Certificate */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-neon-green">Authentication Certificate</CardTitle>
                <CardDescription>Official product certification documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Security Code Image */}
                {auth.unit.securityCodeImage && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Security Code</h4>
                    <div className="aspect-square max-w-48 rounded-lg overflow-hidden border border-gray-700">
                      <img 
                        src={auth.unit.securityCodeImage} 
                        alt="Security Code"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Certificate Download */}
                {auth.unit.certificateUrl ? (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Product Certificate</h4>
                    <Button 
                      onClick={handleDownloadCertificate}
                      className="w-full bg-neon-green hover:bg-neon-green/80 text-deep-black"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate (PDF)
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                    <p className="text-gray-400">Certificate not available</p>
                  </div>
                )}

                <Separator className="bg-gray-700" />

                {/* Order Information */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Order Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Number</span>
                      <span className="font-mono text-white">{auth.order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purchase Date</span>
                      <span className="text-white">
                        {new Date(auth.order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Verified At</span>
                      <span className="text-white">
                        {auth.verifiedAt 
                          ? new Date(auth.verifiedAt).toLocaleString()
                          : 'Not yet verified'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card className="gaming-card mt-8">
            <CardHeader>
              <CardTitle className="text-electric">Authenticity Guarantee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-electric" />
                  <h3 className="font-semibold text-white mb-2">100% Authentic</h3>
                  <p className="text-gray-400 text-sm">
                    This product has been verified as genuine through our QR authentication system.
                  </p>
                </div>
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto mb-3 text-neon-green" />
                  <h3 className="font-semibold text-white mb-2">Quality Assured</h3>
                  <p className="text-gray-400 text-sm">
                    Each unit undergoes rigorous quality control before being assigned a unique identifier.
                  </p>
                </div>
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-blue-400" />
                  <h3 className="font-semibold text-white mb-2">Certified Documentation</h3>
                  <p className="text-gray-400 text-sm">
                    Official certificates and security codes provide additional verification layers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}