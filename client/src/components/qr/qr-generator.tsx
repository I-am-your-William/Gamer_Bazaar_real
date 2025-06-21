import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCodeWithDetails } from '@/lib/types';
import { Download, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRGeneratorProps {
  qrCode: QrCodeWithDetails;
  size?: number;
  showDetails?: boolean;
}

export default function QRGenerator({ qrCode, size = 200, showDetails = true }: QRGeneratorProps) {
  const { toast } = useToast();
  
  const verifyUrl = `${window.location.origin}/verify/${qrCode.code}`;
  
  // Gaming-themed QR code with neon colors
  const styledQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(verifyUrl)}&color=00FF88&bgcolor=0A0A0A&margin=0&ecc=H`;
  
  // Standard QR code for downloading
  const standardQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(verifyUrl)}&format=png&ecc=M`;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = standardQrImageUrl;
    link.download = `qr-${qrCode.serialNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* QR Code Display */}
      <Card className="gaming-card">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Badge className="bg-neon-green text-deep-black mb-2">
              ✓ QR VERIFIED AUTHENTIC
            </Badge>
            <h3 className="font-orbitron font-bold text-xl">Product Authentication</h3>
          </div>
          
          <div className="inline-block p-4 bg-white rounded-xl mb-4">
            <img 
              src={styledQrImageUrl}
              alt={`QR Code for ${qrCode.product.name}`}
              className="w-full h-full object-contain"
              style={{ width: size, height: size }}
            />
          </div>
          
          <p className="text-sm text-gray-400 mb-4">
            Scan with your phone camera or QR code scanner
          </p>

          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(verifyUrl, 'Verification URL')}
              className="border-electric text-electric hover:bg-electric hover:text-deep-black"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQR}
              className="border-neon-green text-neon-green hover:bg-neon-green hover:text-deep-black"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(verifyUrl, '_blank')}
              className="border-gaming-purple text-gaming-purple hover:bg-gaming-purple hover:text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      {showDetails && (
        <Card className="gaming-card">
          <CardContent className="p-6">
            <h4 className="font-orbitron font-bold text-lg mb-4 text-electric">Product Details</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Product:</span>
                  <span className="font-semibold">{qrCode.product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Brand:</span>
                  <span>{qrCode.product.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Serial Number:</span>
                  <span className="font-mono text-sm">{qrCode.serialNumber}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order #:</span>
                  <span className="font-mono text-sm">{qrCode.order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-sm">{new Date(qrCode.createdAt!).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge className={qrCode.isVerified ? 'bg-neon-green text-deep-black' : 'bg-gaming-orange text-white'}>
                    {qrCode.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Features */}
      <Card className="gaming-card border-electric/50">
        <CardContent className="p-6">
          <h4 className="font-orbitron font-bold text-lg mb-4 text-neon-green">Security Features</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-electric/20 rounded-full flex items-center justify-center">
                <span className="text-electric">🛡️</span>
              </div>
              <div>
                <p className="font-semibold">Tamper-Proof</p>
                <p className="text-sm text-gray-400">Unique non-replicable codes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
                <span className="text-neon-green">📜</span>
              </div>
              <div>
                <p className="font-semibold">Digital Certificate</p>
                <p className="text-sm text-gray-400">Blockchain verified</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gaming-purple/20 rounded-full flex items-center justify-center">
                <span className="text-gaming-purple">📧</span>
              </div>
              <div>
                <p className="font-semibold">Email Confirmation</p>
                <p className="text-sm text-gray-400">Instant verification receipt</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gaming-orange/20 rounded-full flex items-center justify-center">
                <span className="text-gaming-orange">🔍</span>
              </div>
              <div>
                <p className="font-semibold">Real-time Verification</p>
                <p className="text-sm text-gray-400">Instant authenticity check</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
