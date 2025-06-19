import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import QRScanner from '@/components/qr/qr-scanner';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { QrCode, CheckCircle, XCircle, Package, Calendar, User } from 'lucide-react';
import type { VerificationResult } from '@/lib/types';

export default function QRScannerPage() {
  const { toast } = useToast();
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const verifyQRMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest(`/api/qr-verify/${code}`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      if (data.verified) {
        toast({
          title: "Verification Successful",
          description: "Product authenticity confirmed!",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "This product could not be verified.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to verify QR code.",
        variant: "destructive",
      });
    },
  });

  const handleScan = (result: string) => {
    setScannedCode(result);
    verifyQRMutation.mutate(result);
  };

  const handleManualVerify = () => {
    if (manualCode.trim()) {
      verifyQRMutation.mutate(manualCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-orbitron font-bold text-4xl mb-4">
            QR CODE <span className="text-electric">SCANNER</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Verify the authenticity of your gaming equipment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <QrCode className="h-6 w-6 mr-3 text-electric" />
                Camera Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <QRScanner onScan={handleScan} />
              </div>
              
              {scannedCode && (
                <Alert className="mb-4 border-electric">
                  <QrCode className="h-4 w-4" />
                  <AlertDescription>
                    Scanned Code: <span className="font-mono">{scannedCode}</span>
                  </AlertDescription>
                </Alert>
              )}

              <div className="border-t border-electric/20 pt-4">
                <h3 className="font-semibold mb-3">Manual Entry</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter QR code manually..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="bg-deep-black border-electric text-white"
                  />
                  <Button 
                    onClick={handleManualVerify}
                    disabled={verifyQRMutation.isPending || !manualCode.trim()}
                    className="bg-electric text-deep-black hover:bg-electric/80"
                  >
                    Verify
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CheckCircle className="h-6 w-6 mr-3 text-neon-green" />
                Verification Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verifyQRMutation.isPending ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-electric border-t-transparent rounded-full"></div>
                </div>
              ) : verificationResult ? (
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="text-center">
                    <Badge 
                      className={`text-lg px-4 py-2 ${
                        verificationResult.verified 
                          ? 'bg-neon-green text-deep-black' 
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {verificationResult.verified ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          AUTHENTIC
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 mr-2" />
                          NOT VERIFIED
                        </>
                      )}
                    </Badge>
                  </div>

                  {verificationResult.verified && (
                    <>
                      {/* Product Info */}
                      <div className="border border-electric/30 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <Package className="h-5 w-5 mr-2 text-electric" />
                          <h3 className="font-semibold">Product Details</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Name:</span>
                            <span className="font-semibold">{verificationResult.product.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Brand:</span>
                            <span>{verificationResult.product.brand || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Serial:</span>
                            <span className="font-mono text-sm">{verificationResult.serialNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="border border-electric/30 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <Calendar className="h-5 w-5 mr-2 text-neon-green" />
                          <h3 className="font-semibold">Order Information</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Order:</span>
                            <span className="font-mono">#{verificationResult.order.orderNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <Badge variant="outline" className="border-neon-green text-neon-green">
                              {verificationResult.order.status}
                            </Badge>
                          </div>
                          {verificationResult.verifiedAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Verified:</span>
                              <span>{new Date(verificationResult.verifiedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Image */}
                      {verificationResult.product.imageUrl && (
                        <div className="text-center">
                          <img
                            src={verificationResult.product.imageUrl}
                            alt={verificationResult.product.name}
                            className="w-48 h-48 object-cover rounded-lg mx-auto border border-electric/30"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {!verificationResult.verified && (
                    <Alert className="border-red-500">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        This QR code could not be verified. Please ensure you're scanning a genuine Gamers Bazaar product code, or contact support if you believe this is an error.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <QrCode className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ready to Scan</h3>
                  <p className="text-gray-400">
                    Use your camera to scan a QR code or enter it manually above
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="gaming-card mt-8">
          <CardHeader>
            <CardTitle>How to Use QR Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-electric rounded-full flex items-center justify-center mx-auto mb-3">
                  <QrCode className="h-6 w-6 text-deep-black" />
                </div>
                <h3 className="font-semibold mb-2">1. Locate QR Code</h3>
                <p className="text-sm text-gray-400">
                  Find the QR code on your product packaging or documentation
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-neon-green rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-deep-black" />
                </div>
                <h3 className="font-semibold mb-2">2. Scan or Enter</h3>
                <p className="text-sm text-gray-400">
                  Use the camera scanner or manually enter the code
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gaming-purple rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">3. Verify Authenticity</h3>
                <p className="text-sm text-gray-400">
                  Get instant verification of your product's authenticity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}