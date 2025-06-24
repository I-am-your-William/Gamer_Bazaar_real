import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AddInventoryUnitSimple() {
  const { toast } = useToast();
  const { isAdminLoggedIn } = useAdminAuth();
  const [formData, setFormData] = useState({
    productId: 1,
    serialNumber: '',
    securityCodeFile: null as File | null,
    certificateFile: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityImagePreview, setSecurityImagePreview] = useState<string | null>(null);
  const [certificateFileName, setCertificateFileName] = useState('');

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

  const handleSecurityFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, securityCodeFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setSecurityImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, certificateFile: file }));
      setCertificateFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serialNumber.trim()) {
      toast({
        title: "Error",
        description: "Serial number is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let securityCodeImageUrl = '';
      let certificateUrl = '';

      // Upload security code image if provided
      if (formData.securityCodeFile) {
        const securityFormData = new FormData();
        securityFormData.append('file', formData.securityCodeFile);
        
        const securityRes = await fetch('/api/upload', {
          method: 'POST',
          body: securityFormData,
          credentials: 'include',
        });
        
        if (securityRes.ok) {
          const securityResult = await securityRes.json();
          securityCodeImageUrl = securityResult.url;
        }
      }

      // Upload certificate if provided
      if (formData.certificateFile) {
        const certFormData = new FormData();
        certFormData.append('file', formData.certificateFile);
        
        const certRes = await fetch('/api/upload', {
          method: 'POST',
          body: certFormData,
          credentials: 'include',
        });
        
        if (certRes.ok) {
          const certResult = await certRes.json();
          certificateUrl = certResult.url;
        }
      }

      // Create inventory unit
      const response = await fetch('/api/inventory-units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: formData.productId,
          serialNumber: formData.serialNumber,
          securityCodeImageUrl: securityCodeImageUrl || null,
          certificateUrl: certificateUrl || null,
          createdBy: 'admin',
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: result.message || `Inventory unit added successfully`,
        });
        
        // Reset form
        setFormData({
          productId: 1,
          serialNumber: '',
          securityCodeFile: null,
          certificateFile: null,
        });
        setSecurityImagePreview(null);
        setCertificateFileName('');
        
        // Clear file inputs
        const securityInput = document.getElementById('security-file') as HTMLInputElement;
        const certInput = document.getElementById('certificate-file') as HTMLInputElement;
        if (securityInput) securityInput.value = '';
        if (certInput) certInput.value = '';
        
      } else {
        throw new Error(result.message || 'Failed to add inventory unit');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add inventory unit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/inventory'}
            className="text-white border-gray-600 hover:bg-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
          
          <h1 className="font-orbitron font-bold text-4xl mb-2">
            ADD INVENTORY <span className="text-electric">UNIT</span>
          </h1>
          <p className="text-gray-400">Add individual units with security codes and certificates</p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Add New Inventory Unit</CardTitle>
            <CardDescription className="text-gray-400">
              Add a new unit to increase stock count
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Product
                </label>
                <div className="text-sm text-gray-400">
                  ASUS ROG Strix G15 Gaming Laptop
                </div>
              </div>

              <div>
                <label htmlFor="serial-number" className="block text-sm font-medium text-white mb-2">
                  Serial Number *
                </label>
                <Input
                  id="serial-number"
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  placeholder="Enter unique serial number"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="security-file" className="block text-sm font-medium text-white mb-2">
                  Security Code Image
                </label>
                <div className="mt-1">
                  <input
                    id="security-file"
                    type="file"
                    accept="image/*"
                    onChange={handleSecurityFileChange}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                  />
                  <p className="text-xs text-gray-400 mt-1">Upload security code image for product verification</p>
                </div>
                {securityImagePreview && (
                  <div className="mt-2">
                    <img src={securityImagePreview} alt="Security code preview" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="certificate-file" className="block text-sm font-medium text-white mb-2">
                  Product Certificate (PDF)
                </label>
                <div className="mt-1">
                  <input
                    id="certificate-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleCertificateFileChange}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                  />
                  <p className="text-xs text-gray-400 mt-1">Upload official product certificate in PDF format</p>
                </div>
                {certificateFileName && (
                  <div className="mt-2 flex items-center text-green-400">
                    <FileText className="w-4 h-4 mr-2" />
                    {certificateFileName}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                {isSubmitting ? 'Adding Unit...' : 'Add Unit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}