import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Upload, FileText, Shield } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { Product } from '@shared/schema';

const formSchema = z.object({
  productId: z.number().min(1, "Please select a product"),
  serialNumber: z.string().min(1, "Serial number is required"),
  securityCodeFile: z.any().optional(),
  certificateFile: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddInventoryUnit() {
  const { toast } = useToast();
  const { isAdminLoggedIn } = useAdminAuth();
  const [securityImagePreview, setSecurityImagePreview] = useState<string | null>(null);
  const [certificateFileName, setCertificateFileName] = useState<string>('');

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

  const { data: products, isLoading: productsLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      try {
        const res = await fetch('/api/products?limit=100', {
          signal: controller.signal
        });
        clearTimeout(timeout);
        return res.json();
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }
    },
  });

  // Pre-select product if coming from inventory page
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedProductId = urlParams.get('productId');
  
  // Set default product when data loads
  if (preSelectedProductId && products?.products && form.watch('productId') === 0) {
    form.setValue('productId', parseInt(preSelectedProductId));
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: 0,
      serialNumber: "",
      securityCodeFile: null,
      certificateFile: null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      let securityCodeImageUrl = '';
      let certificateUrl = '';
      
      try {
        // Upload security code image if provided
        if (data.securityCodeFile) {
          const imageFormData = new FormData();
          imageFormData.append('file', data.securityCodeFile);
          imageFormData.append('type', 'security-code');
          
          const imageRes = await fetch('/api/upload', {
            method: 'POST',
            body: imageFormData,
            credentials: 'include',
          });
          
          if (imageRes.ok) {
            const imageResult = await imageRes.json();
            securityCodeImageUrl = imageResult.url;
          }
        }
        
        // Upload certificate if provided
        if (data.certificateFile) {
          const certFormData = new FormData();
          certFormData.append('file', data.certificateFile);
          certFormData.append('type', 'certificate');
          
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
        console.log('Sending data:', {
          productId: data.productId,
          serialNumber: data.serialNumber,
          securityCodeImageUrl,
          certificateUrl,
          createdBy: 'admin',
        });
        
        const res = await fetch('/api/inventory-units', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: data.productId,
            serialNumber: data.serialNumber,
            securityCodeImageUrl: securityCodeImageUrl || null,
            certificateUrl: certificateUrl || null,
            createdBy: 'admin',
          }),
          credentials: 'include',
        });
        
        const responseText = await res.text();
        console.log('Raw server response:', responseText);
        
        if (!res.ok) {
          console.error('Server error response:', responseText);
          throw new Error(`Server error: ${res.status} - ${responseText}`);
        }
        
        try {
          const result = JSON.parse(responseText);
          console.log('Success! Parsed response:', result);
          return result;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response was:', responseText);
          throw new Error('Invalid server response format');
        }
      } catch (error) {
        console.error('Error in mutation function:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('SUCCESS! Mutation completed with data:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-units'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      // Force toast to show
      setTimeout(() => {
        toast({
          title: "✅ Success!", 
          description: data.message || `Inventory unit ${data.unitId} added successfully`,
          variant: "default",
        });
      }, 100);
      
      form.reset();
      setSecurityImagePreview(null);
      setCertificateFileName('');
    },
    onError: (error: any) => {
      console.error('❌ MUTATION ERROR:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Force error toast to show
      setTimeout(() => {
        toast({
          title: "❌ Error",
          description: error.message || "Failed to add inventory unit",
          variant: "destructive",
        });
      }, 100);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleSecurityImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('securityCodeFile', file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSecurityImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('certificateFile', file);
      setCertificateFileName(file.name);
    }
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center text-white">
        <div className="animate-spin h-12 w-12 border-4 border-electric border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              New Inventory Unit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Product Selection */}
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Product</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {products?.products?.map((product) => (
                            <SelectItem 
                              key={product.id} 
                              value={product.id.toString()}
                              className="text-white hover:bg-gray-700"
                            >
                              {product.name} ({product.brand})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Serial Number */}
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Serial Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter unique serial number"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Security Code Image */}
                <FormField
                  control={form.control}
                  name="securityCodeFile"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Security Code Image
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleSecurityImageChange}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                          <p className="text-sm text-gray-400">
                            Upload security code image for product verification
                          </p>
                          {securityImagePreview && (
                            <div className="mt-3">
                              <img
                                src={securityImagePreview}
                                alt="Security code preview"
                                className="w-32 h-32 object-cover rounded border border-gray-600"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Certificate Upload */}
                <FormField
                  control={form.control}
                  name="certificateFile"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Product Certificate (PDF)
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={handleCertificateChange}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                          <p className="text-sm text-gray-400">
                            Upload official product certificate in PDF format
                          </p>
                          {certificateFileName && (
                            <div className="flex items-center gap-2 text-sm text-green-400">
                              <FileText className="w-4 h-4" />
                              {certificateFileName}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {mutation.isPending ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Adding Unit...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Add Unit
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}