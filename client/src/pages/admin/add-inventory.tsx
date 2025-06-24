import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Upload } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { Product } from '@shared/schema';

const addInventorySchema = z.object({
  productId: z.number().min(1, 'Please select a product'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  securityCodeImageUrl: z.string().optional(),
});

type AddInventoryFormData = z.infer<typeof addInventorySchema>;

export default function AddInventory() {
  const { toast } = useToast();
  const { adminLogout } = useAdminAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: products, isLoading: productsLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['/api/products', 'add-inventory'],
    queryFn: () => fetch('/api/products?limit=50').then(res => res.json()),
    staleTime: 0,
  });

  const form = useForm<AddInventoryFormData>({
    resolver: zodResolver(addInventorySchema),
    defaultValues: {
      productId: 0,
      serialNumber: '',
      securityCodeImageUrl: '',
    },
  });

  console.log('Add Inventory - Products available:', products?.products?.length);
  console.log('Add Inventory - Product names:', products?.products?.map(p => p.name));

  const addInventoryMutation = useMutation({
    mutationFn: async (data: AddInventoryFormData) => {
      let securityCodeImageUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        console.log('Uploading file:', imageFile.name, imageFile.type);
        const formData = new FormData();
        formData.append('image', imageFile); // Must match server expectation
        
        const uploadRes = await apiRequest('POST', '/api/upload/security-code', formData);
        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Upload failed: ${errorText}`);
        }
        const uploadResult = await uploadRes.json();
        securityCodeImageUrl = uploadResult.url;
      }

      console.log('Sending inventory unit data:', {
        productId: data.productId,
        serialNumber: data.serialNumber,
        securityCodeImageUrl,
        createdBy: 'admin',
      });

      const res = await apiRequest('POST', '/api/inventory-units', {
        productId: data.productId,
        serialNumber: data.serialNumber,
        securityCodeImageUrl,
        createdBy: 'admin',
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-units'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: data.message || `Inventory unit ${data.unitId} added successfully`,
      });
      form.reset();
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add inventory item",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: AddInventoryFormData) => {
    addInventoryMutation.mutate(data);
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Add Inventory Item</h1>
            <p className="text-gray-400">Add individual units with serial numbers and security codes to increase stock count</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/inventory'}
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Add Individual Unit to Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                              {product.name} {product.sku && `(${product.sku})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Serial Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter serial number"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label className="text-white">Security Code Image (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="text-white border-gray-600 hover:bg-gray-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Security code preview"
                        className="max-w-xs rounded border border-gray-600"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={addInventoryMutation.isPending}
                  className="w-full bg-gaming-orange hover:bg-gaming-orange/80"
                >
                  {addInventoryMutation.isPending ? 'Adding Unit...' : 'Add Unit to Inventory'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}