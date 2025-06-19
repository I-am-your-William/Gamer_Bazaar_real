import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import QRScanner from '@/components/qr/qr-scanner';
import { CheckCircle, XCircle, Camera, Keyboard } from 'lucide-react';

export default function Verify() {
  const { code: urlCode } = useParams();
  const [verificationCode, setVerificationCode] = useState(urlCode || '');
  const [verificationMethod, setVerificationMethod] = useState<'manual' | 'camera'>('manual');

  const { data: verificationResult, isLoading, error } = useQuery({
    queryKey: [`/api/verify/${verificationCode}`],
    enabled: !!verificationCode && verificationCode.length > 10,
  });

  const handleCodeInput = (code: string) => {
    setVerificationCode(code);
  };

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <Header />
      
      {/* Header */}
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-orbitron font-bold text-4xl lg:text-6xl mb-4">
              PRODUCT <span className="text-electric">VERIFICATION</span>
            </h1>
            <p className="text-xl text-gray-300">
              Authenticate your gaming equipment with QR technology
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {!verificationResult && !isLoading && (
            <>
              {/* Verification Method Selection */}
              <div className="text-center mb-12">
                <h2 className="font-orbitron font-bold text-3xl mb-6">Choose Verification Method</h2>
                <div className="flex justify-center gap-4">
                  <Button
                    variant={verificationMethod === 'manual' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('manual')}
                    className={verificationMethod === 'manual' ? 
                      'bg-electric text-deep-black' : 
                      'border-electric text-electric hover:bg-electric hover:text-deep-black'
                    }
                  >
                    <Keyboard className="h-4 w-4 mr-2" />
                    Manual Entry
                  </Button>
                  <Button
                    variant={verificationMethod === 'camera' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('camera')}
                    className={verificationMethod === 'camera' ? 
                      'bg-electric text-deep-black' : 
                      'border-electric text-electric hover:bg-electric hover:text-deep-black'
                    }
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    QR Scanner
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Verification Input */}
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="flex items-center font-orbitron">
                      {verificationMethod === 'manual' ? (
                        <>
                          <Keyboard className="h-5 w-5 mr-2 text-electric" />
                          Manual Verification
                        </>
                      ) : (
                        <>
                          <Camera className="h-5 w-5 mr-2 text-electric" />
                          QR Code Scanner
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {verificationMethod === 'manual' ? (
                      <>
                        <Input
                          type="text"
                          placeholder="Enter verification code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="bg-dark-gray border-electric/30 text-center text-lg tracking-wider"
                        />
                        <p className="text-sm text-gray-400">
                          Enter the verification code found on your product packaging or QR code
                        </p>
                      </>
                    ) : (
                      <QRScanner onScan={handleCodeInput} />
                    )}
                  </CardContent>
                </Card>

                {/* Verification Features */}
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="flex items-center font-orbitron text-neon-green">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Authentication Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-electric/20 rounded-full flex items-center justify-center">
                          <span className="text-electric">🛡️</span>
                        </div>
                        <div>
                          <p className="font-semibold">Tamper-Proof QR Codes</p>
                          <p className="text-sm text-gray-400">Unique codes that cannot be replicated</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
                          <span className="text-neon-green">📜</span>
                        </div>
                        <div>
                          <p className="font-semibold">Digital Certificates</p>
                          <p className="text-sm text-gray-400">Verified authenticity records</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gaming-purple/20 rounded-full flex items-center justify-center">
                          <span className="text-gaming-purple">📧</span>
                        </div>
                        <div>
                          <p className="font-semibold">Email Confirmations</p>
                          <p className="text-sm text-gray-400">Instant verification receipts</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gaming-orange/20 rounded-full flex items-center justify-center">
                          <span className="text-gaming-orange">🔗</span>
                        </div>
                        <div>
                          <p className="font-semibold">Blockchain Secured</p>
                          <p className="text-sm text-gray-400">Immutable verification records</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="animate-spin h-12 w-12 border-4 border-electric border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold mb-2">Verifying Product...</h3>
              <p className="text-gray-400">Please wait while we authenticate your product</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="gaming-card border-red-500 border-2">
              <CardContent className="text-center py-16">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="font-orbitron font-bold text-2xl mb-4 text-red-500">
                  VERIFICATION FAILED
                </h3>
                <p className="text-gray-300 mb-6">
                  The verification code you entered is invalid or the product could not be found.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Please check that you entered the code correctly</p>
                  <p>• Ensure the QR code is not damaged or tampered with</p>
                  <p>• Contact customer support if you continue to have issues</p>
                </div>
                <Button 
                  onClick={() => {
                    setVerificationCode('');
                    window.location.reload();
                  }}
                  className="mt-6 bg-electric text-deep-black"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {verificationResult?.verified && (
            <Card className="gaming-card border-neon-green border-2">
              <CardContent className="py-12">
                <div className="text-center mb-8">
                  <CheckCircle className="h-16 w-16 text-neon-green mx-auto mb-4" />
                  <h3 className="font-orbitron font-bold text-3xl mb-4 text-neon-green">
                    VERIFIED AUTHENTIC
                  </h3>
                  <p className="text-gray-300">
                    This product has been successfully verified as genuine
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Product Information */}
                  <div className="space-y-4">
                    <h4 className="font-orbitron font-bold text-xl mb-4">Product Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Product:</span>
                        <span className="font-semibold">{verificationResult.product.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Brand:</span>
                        <span>{verificationResult.product.brand || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Serial Number:</span>
                        <span className="font-mono text-sm">{verificationResult.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Order #:</span>
                        <span className="font-mono text-sm">{verificationResult.order.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Verified:</span>
                        <span className="text-neon-green">
                          {verificationResult.verifiedAt ? 
                            new Date(verificationResult.verifiedAt).toLocaleDateString() : 
                            'Just now'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warranty and Status */}
                  <div className="space-y-4">
                    <h4 className="font-orbitron font-bold text-xl mb-4">Status & Warranty</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-neon-green text-deep-black">✓ AUTHENTIC</Badge>
                        <span className="text-sm">Product verified genuine</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-electric text-deep-black">📦 DELIVERED</Badge>
                        <span className="text-sm">Successfully delivered</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gaming-purple text-white">🛡️ WARRANTY</Badge>
                        <span className="text-sm">2-year manufacturer warranty</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-deep-black rounded-lg">
                      <p className="text-sm text-gray-400">
                        <strong>Note:</strong> A verification confirmation has been sent to your email address. 
                        Keep this for your records and warranty claims.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
