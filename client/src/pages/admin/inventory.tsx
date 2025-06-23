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
  // Removed stock update controls - only unit-based management allowed

  const handleLogout = () => {
    adminLogout();
    window.location.href = '/';
  };

  const { data: products, isLoading: productsLoading, error } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000,
  });

  console.log('Products data:', products);
  console.log('Products loading:', productsLoading);
  console.log('Products error:', error);

  // Stock can only be managed through individual units now

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error loading products: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Inventory Management</h1>
            <p className="text-gray-400">View product stock levels - Add individual units to increase stock count</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => window.location.href = '/admin/add-inventory'}
              className="bg-gaming-orange hover:bg-gaming-orange/80"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Unit
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin/inventory-units'}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <Package className="w-4 h-4 mr-2" />
              View All Units
            </Button>
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

        <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-blue-200 text-sm">
            <strong>Note:</strong> Stock can only be increased by adding individual units with serial numbers and security codes. 
            Use "Add Unit" to increase inventory count.
          </p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Product Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Product</TableHead>
                  <TableHead className="text-gray-300">SKU</TableHead>
                  <TableHead className="text-gray-300">Price</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Available Units</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!products?.products || products.products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                      No products found. Check console for debugging information.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.products.map((product) => (
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
                    <TableCell className="text-white text-center">
                      <span className="text-2xl font-bold text-electric">{product.stockQuantity}</span>
                      <div className="text-xs text-gray-400">Available Units</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.location.href = '/admin/add-inventory'}
                          size="sm"
                          className="bg-gaming-orange hover:bg-gaming-orange/80"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Unit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/admin/inventory-units?productId=${product.id}`}
                          className="text-white border-gray-600 hover:bg-gray-700"
                        >
                          View Units
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}