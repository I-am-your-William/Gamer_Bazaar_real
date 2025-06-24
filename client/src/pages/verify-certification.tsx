import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle, AlertCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface VerificationResult {
  success: boolean;
  productName: string;
  orderNumber: string;
  message: string;
}

export default function VerifyCertification() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [serialNumber, setSerialNumber] = useState('');
  const [verificationKey, setVerificationKey] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Extract orderId from URL params
  const orderId = params.orderId;

  // Generate verification key (special alphabet characters before and after input)
  useEffect(() => {
    if (orderId) {
      // Generate a consistent key based on orderId
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const hash = orderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const prefixChar = chars[hash % chars.length];
      const suffixChar = chars[(hash * 2) % chars.length];
      setVerificationKey(`${prefixChar}***${suffixChar}`);
    }
  }, [orderId]);

  const verifyMutation = useMutation({
    mutationFn: async (data: { orderId: string; serialNumber: string }) => {
      const res = await apiRequest('POST', '/api/verify-certification', data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Verification failed');
      }
      return await res.json();
    },
    onSuccess: (result: VerificationResult) => {
      setIsVerified(true);
      setVerificationResult(result);
      toast({
        title: "Product Certified!",
        description: "Certification email has been sent to your account.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid serial number or order ID.",
        variant: "destructive",
      });
    },
  });

  const handleVerification = () => {
    if (!serialNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the product serial number.",
        variant: "destructive",
      });
      return;
    }

    if (!orderId) {
      toast({
        title: "Invalid Request",
        description: "Order ID is missing from the URL.",
        variant: "destructive",
      });
      return;
    }

    verifyMutation.mutate({ orderId, serialNumber: serialNumber.trim() });
  };

  if (isVerified && verificationResult) {
    return (
      <div className="min-h-screen bg-deep-black text-white py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="gaming-card border-green-500/50 bg-gradient-to-br from-green-900/20 to-emerald-900/10">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-green-400">Product Certified!</CardTitle>
              <CardDescription className="text-gray-300">
                Your product has been successfully verified and certified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-green-900/20 rounded-lg border border-green-500/30">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-bold text-green-400 mb-2">
                  This product has been certified by seller
                </h3>
                <p className="text-gray-300">
                  {verificationResult.productName} from Order #{verificationResult.orderNumber}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span>Product authenticity verified</span>
                </div>
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span>Serial number validated</span>
                </div>
                <div className="flex items-center gap-3 text-green-400">
                  <Mail className="h-5 w-5" />
                  <span>Certification email sent</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate('/orders')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1 border-green-500 text-green-400 hover:bg-green-900/20"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-white py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="gaming-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-electric rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-deep-black" />
            </div>
            <CardTitle className="text-2xl">Product Certification</CardTitle>
            <CardDescription>
              Verify your product authenticity using the serial number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-4 bg-electric/10 rounded-lg border border-electric/30">
              <p className="text-sm text-gray-400 mb-2">Verification Key Format:</p>
              <div className="font-mono text-lg text-electric">
                {verificationKey}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Replace *** with your product serial number
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="orderId" className="text-gray-300">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId || ''}
                  disabled
                  className="bg-gray-800 border-gray-600 text-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="serialNumber" className="text-gray-300">
                  Product Serial Number *
                </Label>
                <Input
                  id="serialNumber"
                  placeholder="Enter serial number from your product"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={verifyMutation.isPending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find this number on your product packaging or device
                </p>
              </div>
            </div>

            <Button
              onClick={handleVerification}
              disabled={verifyMutation.isPending || !serialNumber.trim()}
              className="w-full bg-gradient-to-r from-electric to-neon-green text-deep-black font-bold"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Product
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => navigate('/orders')}
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}