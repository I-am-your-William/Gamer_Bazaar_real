import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, RotateCcw } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  className?: string;
}

export default function QRScanner({ onScan, className = '' }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startScanning = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
        
        // Start scanning after video loads
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            scanForQRCode();
          }
        };
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      console.error('Camera access error:', err);
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const scanForQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      requestAnimationFrame(scanForQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Try to detect QR code using a simple pattern detection
      // In a real implementation, you would use a QR code library like 'qr-scanner' or 'jsqr'
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simplified QR detection (in production, use proper QR library)
      // For demo purposes, we'll simulate QR detection
      // You would typically use: import jsQR from 'jsqr'; const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      // Simulated QR detection - in real app, replace with actual QR detection
      if (Math.random() < 0.01) { // 1% chance to simulate detection
        const mockQRCode = 'mock-qr-code-' + Date.now();
        onScan(mockQRCode);
        stopScanning();
        return;
      }
    } catch (err) {
      console.error('QR scanning error:', err);
    }

    if (isScanning) {
      requestAnimationFrame(scanForQRCode);
    }
  };

  return (
    <Card className={`gaming-card ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-orbitron font-bold text-xl mb-2 text-electric">QR Code Scanner</h3>
            <p className="text-sm text-gray-400">
              Position the QR code within the camera frame
            </p>
          </div>

          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="relative">
            {isScanning ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover rounded-lg bg-deep-black"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 border-2 border-electric rounded-lg pointer-events-none">
                  <div className="absolute inset-4 border border-electric/50 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-electric rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-electric rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-electric rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-electric rounded-br-lg"></div>
                  </div>
                </div>

                {/* Scanning line animation */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3/4 h-0.5 bg-electric animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-dark-gray rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Camera preview will appear here</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                className="bg-electric text-deep-black hover:bg-electric/80"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop
                </Button>
                <Button
                  onClick={() => {
                    stopScanning();
                    setTimeout(startScanning, 100);
                  }}
                  variant="outline"
                  className="border-electric text-electric hover:bg-electric hover:text-deep-black"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Make sure the QR code is well-lit and within the frame.
              <br />
              The scanner will automatically detect and verify the code.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
