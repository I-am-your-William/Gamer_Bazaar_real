import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CartItemWithProduct } from '@/lib/types';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function Cart() {
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

  const subtotal = cartItems.reduce(
    (sum: number, item: CartItemWithProduct) => 
      sum + (parseFloat(item.product.salePrice || item.product.price) * item.quantity), 
    0
  );

  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="gaming-card p-6 rounded-xl">
                <div className="flex space-x-4">
                  <div className="w-24 h-24 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <Header />
      
      {/* Header */}
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-orbitron font-bold text-4xl lg:text-6xl mb-4">
              SHOPPING <span className="text-electric">CART</span>
            </h1>
            <p className="text-xl text-gray-300">
              Review your gaming gear selection
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="font-orbitron font-bold text-3xl mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Start shopping to add items to your cart</p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-electric to-neon-green text-deep-black px-8 py-4 rounded-full font-bold text-lg">
                START SHOPPING
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-orbitron font-bold text-2xl">
                  Cart Items ({cartItems.length})
                </h2>
                {cartItems.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => clearCartMutation.mutate()}
                    disabled={clearCartMutation.isPending}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {cartItems.map((item: CartItemWithProduct) => (
                <Card key={item.id} className="gaming-card">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <img 
                        src={item.product.imageUrl || "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46"}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{item.product.name}</h3>
                            {item.product.brand && (
                              <p className="text-electric text-sm">{item.product.brand}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItemMutation.mutate(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity, -1)}
                              disabled={updateQuantityMutation.isPending}
                              className="h-8 w-8 p-0 border-electric/30"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity, 1)}
                              disabled={updateQuantityMutation.isPending}
                              className="h-8 w-8 p-0 border-electric/30"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-neon-green">
                              ${(parseFloat(item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400">
                              ${item.product.salePrice || item.product.price} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="gaming-card sticky top-24">
                <CardHeader>
                  <CardTitle className="font-orbitron">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>
                      {shipping === 0 ? (
                        <Badge className="bg-neon-green text-deep-black">FREE</Badge>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <p className="text-sm text-gray-400">
                      Free shipping on orders over $50
                    </p>
                  )}
                  
                  <div className="border-t border-electric/20 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-neon-green">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <Link href="/checkout">
                      <Button className="w-full bg-gradient-to-r from-electric to-neon-green text-deep-black font-bold py-3 rounded-lg hover:shadow-neon-glow">
                        <ShoppingBag className="h-5 w-5 mr-2" />
                        PROCEED TO CHECKOUT
                      </Button>
                    </Link>
                    
                    <Link href="/products">
                      <Button variant="outline" className="w-full border-electric text-electric hover:bg-electric hover:text-deep-black">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  {/* Security Features */}
                  <div className="pt-4 space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="text-neon-green">🔒</span>
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-electric">📱</span>
                      <span>QR verification included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gaming-purple">🔄</span>
                      <span>30-day return policy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
