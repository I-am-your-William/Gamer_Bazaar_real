import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Minus, Home, LogOut } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { Product } from '@shared/schema';

export default function AdminInventory() {
  const { toast } = useToast();
  const { adminLogout } = useAdminAuth();
  const [stockUpdates, setStockUpdates] = useState<{ [key: number]: number }>({});

  const handleLogout = () => {
    adminLogout();
    window.location.href = '/';
  };

  const { data: products, isLoading: productsLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['/api/products'],
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, stock_quantity }: { productId: number; stock_quantity: number }) => {
      const res = await apiRequest("PATCH", `/api/products/${productId}`, { stock_quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update stock",
        variant: "destructive",
      });
    },
  });

  const handleStockUpdate = (productId: number) => {
    const newStock = stockUpdates[productId];
    if (newStock !== undefined && newStock >= 0) {
      updateStockMutation.mutate({ productId, stock_quantity: newStock });
      setStockUpdates(prev => ({ ...prev, [productId]: undefined }));
    }
  };

  const adjustStock = (productId: number, adjustment: number) => {
    const product = products?.products?.find(p => p.id === productId);
    if (product) {
      const currentStock = stockUpdates[productId] !== undefined ? stockUpdates[productId] : product.stockQuantity;
      const newStock = Math.max(0, currentStock + adjustment);
      setStockUpdates(prev => ({ ...prev, [productId]: newStock }));
    }
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
            <h1 className="text-4xl font-bold text-white mb-2">Inventory Management</h1>
            <p className="text-gray-400">Manage product stock levels</p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin'}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <Package className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Homepage
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Product</TableHead>
                  <TableHead className="text-gray-300">SKU</TableHead>
                  <TableHead className="text-gray-300">Price</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Current Stock</TableHead>
                  <TableHead className="text-gray-300">Update Stock</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.products?.map((product) => (
                  <TableRow key={product.id} className="border-gray-700">
                    <TableCell className="text-white">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-400">
                            {product.brand} {product.sku && <span className="text-electric">• SKU: {product.sku}</span>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-electric font-mono">
                      {product.sku || `AUTO_${product.id}`}
                    </TableCell>
                    <TableCell className="text-white">${product.price}</TableCell>
                    <TableCell>
                      <Badge variant={product.stockQuantity > 0 ? "secondary" : "destructive"}>
                        {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">
                      {stockUpdates[product.id] !== undefined ? stockUpdates[product.id] : product.stockQuantity}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustStock(product.id, -1)}
                          className="text-white border-gray-600 hover:bg-gray-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={stockUpdates[product.id] !== undefined ? stockUpdates[product.id] : product.stockQuantity}
                          onChange={(e) => setStockUpdates(prev => ({ ...prev, [product.id]: parseInt(e.target.value) || 0 }))}
                          className="w-20 bg-gray-800 border-gray-600 text-white"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustStock(product.id, 1)}
                          className="text-white border-gray-600 hover:bg-gray-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleStockUpdate(product.id)}
                        disabled={updateStockMutation.isPending || stockUpdates[product.id] === undefined}
                        className="bg-gaming-orange hover:bg-gaming-orange/80"
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}