import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CartItemWithProduct } from '@/lib/types';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['/api/cart'],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiRequest('PUT', `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
  });

  const updateQuantity = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const totalAmount = cartItems.reduce(
    (sum: number, item: CartItemWithProduct) => 
      sum + (parseFloat(item.product.salePrice || item.product.price) * item.quantity), 
    0
  );

  const totalItems = cartItems.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-charcoal border-electric/20 w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between text-white">
            <span className="font-orbitron">Shopping Cart</span>
            {totalItems > 0 && (
              <Badge className="bg-electric text-deep-black">
                {totalItems} items
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-electric border-t-transparent rounded-full"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-bold mb-2 text-white">Your cart is empty</h3>
              <p className="text-gray-400 mb-6">Start shopping to add items to your cart</p>
              <Link href="/products">
                <Button 
                  className="bg-electric text-deep-black px-6 py-2 rounded-full font-bold"
                  onClick={() => onOpenChange(false)}
                >
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {cartItems.map((item: CartItemWithProduct) => (
                  <div key={item.id} className="gaming-card p-4 rounded-lg">
                    <div className="flex space-x-4">
                      <img 
                        src={item.product.imageUrl || "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white line-clamp-2 mb-1">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-400 mb-2">
                          ${item.product.salePrice || item.product.price}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-electric/30"
                              onClick={() => updateQuantity(item.id, item.quantity, -1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-white font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-electric/30"
                              onClick={() => updateQuantity(item.id, item.quantity, 1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 p-1"
                            onClick={() => removeItemMutation.mutate(item.id)}
                            disabled={removeItemMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-electric/20 pt-4 space-y-4">
                <div className="flex items-center justify-between text-lg font-bold text-white">
                  <span>Total:</span>
                  <span className="text-neon-green">${totalAmount.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Link href="/checkout">
                    <Button 
                      className="w-full bg-gradient-to-r from-electric to-neon-green text-deep-black font-bold py-3 rounded-lg"
                      onClick={() => onOpenChange(false)}
                    >
                      Checkout
                    </Button>
                  </Link>
                  
                  <Link href="/cart">
                    <Button 
                      variant="outline" 
                      className="w-full border-electric text-electric"
                      onClick={() => onOpenChange(false)}
                    >
                      View Full Cart
                    </Button>
                  </Link>

                  {cartItems.length > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full text-red-400 hover:text-red-300"
                      onClick={() => clearCartMutation.mutate()}
                      disabled={clearCartMutation.isPending}
                    >
                      Clear Cart
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
