import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import ReviewSection from '@/components/reviews/ReviewSection';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { ShoppingCart, Heart, Star, Shield, Truck, RotateCcw } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/slug/${slug}`],
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="h-96 bg-gray-700 rounded-xl"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                <div className="h-20 bg-gray-700 rounded"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-deep-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-400 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button className="bg-electric text-deep-black">
              Browse Products
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discountPercentage = originalPrice && product.salePrice 
    ? Math.round(((parseFloat(originalPrice) - parseFloat(product.salePrice)) / parseFloat(originalPrice)) * 100)
    : 0;

  const images = product.imageUrls || [product.imageUrl || "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46"];

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-gray-400">
          <Link href="/" className="hover:text-electric">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-electric">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{product.name}</span>
        </nav>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl gaming-card"
              />
              <Badge className="absolute top-4 left-4 bg-neon-green text-deep-black">
                ✓ QR VERIFIED
              </Badge>
              {discountPercentage > 0 && (
                <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-electric' : 'border-gray-600'
                    }`}
                  >
                    <img 
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-orbitron font-bold text-3xl lg:text-4xl mb-2">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-electric text-lg font-semibold mb-4">
                  {product.brand}
                </p>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-gray-400">(4.8/5 - 127 reviews)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-neon-green">
                  ${currentPrice}
                </span>
                {originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${originalPrice}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-red-500 text-white">
                    Save {discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border border-electric/30 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3"
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-gray-400">
                  {product.stockQuantity > 0 ? 
                    `${product.stockQuantity} in stock` : 
                    'Out of stock'
                  }
                </span>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending || !product.stockQuantity}
                  className="flex-1 bg-gradient-to-r from-electric to-neon-green text-deep-black font-bold py-3 rounded-lg hover:shadow-neon-glow"
                >
                  {addToCartMutation.isPending ? (
                    <div className="animate-spin h-5 w-5 border-2 border-deep-black border-t-transparent rounded-full mr-2"></div>
                  ) : (
                    <ShoppingCart className="h-5 w-5 mr-2" />
                  )}
                  Add to Cart
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-electric text-electric hover:bg-electric hover:text-deep-black"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-neon-green" />
                <span>QR Verified Authentic</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-electric" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4 text-gaming-purple" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>2-Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-charcoal">
              <TabsTrigger value="specifications" className="data-[state=active]:bg-electric data-[state=active]:text-deep-black">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-electric data-[state=active]:text-deep-black">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:bg-electric data-[state=active]:text-deep-black">
                Shipping & Returns
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="specifications" className="mt-6">
              <Card className="gaming-card">
                <CardContent className="pt-6">
                  <h3 className="font-orbitron font-bold text-xl mb-4">Technical Specifications</h3>
                  {product.specifications ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-600">
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-gray-300">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No specifications available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <ReviewSection productId={product.id} />
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-6">
              <Card className="gaming-card">
                <CardContent className="pt-6">
                  <h3 className="font-orbitron font-bold text-xl mb-4">Shipping & Returns</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Shipping</h4>
                      <p className="text-gray-400">Free standard shipping on all orders. Express shipping available for $9.99.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Returns</h4>
                      <p className="text-gray-400">30-day return policy. Items must be in original condition with QR code intact.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
