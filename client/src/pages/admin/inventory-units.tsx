import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Search, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { Product } from '@shared/schema';

interface InventoryUnit {
  id: number;
  unitId: string;
  productId: number;
  serialNumber: string;
  securityCodeImageUrl?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  product: Product;
}

export default function InventoryUnits() {
  const { adminLogout } = useAdminAuth();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['/api/products'],
  });

  const { data: inventoryUnits, isLoading } = useQuery<InventoryUnit[]>({
    queryKey: ['/api/inventory-units', selectedProduct, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProduct) params.append('productId', selectedProduct);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/inventory-units?${params}`);
      return response.json();
    },
  });

  const filteredUnits = inventoryUnits?.filter(unit =>
    unit.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.unitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleLogout = () => {
    adminLogout();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading inventory units...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Individual Inventory Units</h1>
            <p className="text-gray-400">Track all individual units with serial numbers and security codes</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => window.location.href = '/admin/add-inventory-unit'}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Unit
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin/inventory'}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Inventory
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by serial number, unit ID, or product name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by product" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">All Products</SelectItem>
                  {products?.products?.map((product) => (
                    <SelectItem 
                      key={product.id} 
                      value={product.id.toString()}
                      className="text-white hover:bg-gray-700"
                    >
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">All Status</SelectItem>
                  <SelectItem value="available" className="text-white hover:bg-gray-700">Available</SelectItem>
                  <SelectItem value="sold" className="text-white hover:bg-gray-700">Sold</SelectItem>
                  <SelectItem value="reserved" className="text-white hover:bg-gray-700">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Units Table */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Individual Units ({filteredUnits.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Unit ID</TableHead>
                  <TableHead className="text-gray-300">Product</TableHead>
                  <TableHead className="text-gray-300">Serial Number</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Security Code</TableHead>
                  <TableHead className="text-gray-300">Added By</TableHead>
                  <TableHead className="text-gray-300">Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id} className="border-gray-700">
                    <TableCell className="text-electric font-mono">
                      {unit.unitId}
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-3">
                        {unit.product.imageUrl && (
                          <img
                            src={unit.product.imageUrl}
                            alt={unit.product.name}
                            className="h-10 w-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{unit.product.name}</div>
                          <div className="text-sm text-gray-400">{unit.product.brand}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      {unit.serialNumber}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          unit.status === 'available' ? 'secondary' : 
                          unit.status === 'sold' ? 'destructive' : 'default'
                        }
                      >
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {unit.securityCodeImageUrl ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(unit.securityCodeImageUrl, '_blank')}
                          className="text-white border-gray-600 hover:bg-gray-700"
                        >
                          View Image
                        </Button>
                      ) : (
                        <span className="text-gray-500">No image</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {unit.createdBy}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(unit.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUnits.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No inventory units found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}