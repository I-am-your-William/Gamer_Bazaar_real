import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@shared/schema';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to add products to your cart.",
        variant: "destructive",
      });
      return;
    }
    
    addToCartMutation.mutate();
  };

  const currentPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discountPercentage = originalPrice && product.salePrice 
    ? Math.round(((parseFloat(originalPrice) - parseFloat(product.salePrice)) / parseFloat(originalPrice)) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="gaming-card rounded-xl overflow-hidden group cursor-pointer h-full">
        <div className="relative">
          <img 
            src={product.imageUrl || "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
            alt={product.name} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          <div className="absolute top-3 left-3 bg-neon-green text-deep-black px-2 py-1 rounded text-xs font-bold">
            ✓ QR VERIFIED
          </div>
          {discountPercentage > 0 && (
            <Badge className="absolute top-3 right-3 bg-red-500 text-white">
              -{discountPercentage}%
            </Badge>
          )}
          {!product.stockQuantity && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col h-full">
          <div className="flex-1">
            <h3 className="font-semibold mb-2 group-hover:text-electric transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {product.brand && `${product.brand} • `}
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-neon-green">
                ${currentPrice}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:text-gaming-purple"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Implement wishlist functionality
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
              
              <Button 
                size="sm" 
                className="bg-electric text-deep-black p-2 hover:bg-electric/80 transition-colors"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || !product.stockQuantity}
              >
                {addToCartMutation.isPending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-deep-black border-t-transparent rounded-full"></div>
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
