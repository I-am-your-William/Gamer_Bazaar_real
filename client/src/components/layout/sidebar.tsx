import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Home, 
  ShoppingCart, 
  QrCode, 
  User, 
  Settings, 
  LogOut,
  X,
  TrendingUp,
  Package,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isAuthenticated } = useAuth();

  const { data: cartItems } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const cartItemCount = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  const featuredProducts = products?.products?.slice(0, 3) || [];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-deep-black border-r border-electric z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-electric rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-deep-black" />
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-xl text-white">
                  GAMER<span className="text-electric">S</span>
                </h1>
                <p className="text-sm text-gray-400">BAZAAR</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="mb-8 p-4 gaming-card rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-electric rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-deep-black" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {user.firstName || 'Gamer'}
                  </p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="space-y-2 mb-8">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-electric hover:text-deep-black"
                onClick={onClose}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Button>
            </Link>

            <Link href="/products">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-electric hover:text-deep-black"
                onClick={onClose}
              >
                <Package className="h-5 w-5 mr-3" />
                Products
              </Button>
            </Link>

            {isAuthenticated && (
              <Link href="/cart">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-electric hover:text-deep-black"
                  onClick={onClose}
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Cart
                  {cartItemCount > 0 && (
                    <Badge className="ml-auto bg-neon-green text-deep-black">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            <Link href="/qr-scanner">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-neon-green hover:text-deep-black"
                onClick={onClose}
              >
                <QrCode className="h-5 w-5 mr-3" />
                QR Scanner
              </Button>
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/settings">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white hover:bg-electric hover:text-deep-black"
                    onClick={onClose}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Button>
                </Link>

                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-white hover:bg-gaming-purple hover:text-white"
                      onClick={onClose}
                    >
                      <TrendingUp className="h-5 w-5 mr-3" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-white mb-4">Featured Products</h3>
              <div className="space-y-3">
                {featuredProducts.map((product: any) => (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <Card className="gaming-card cursor-pointer hover:border-electric" onClick={onClose}>
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-charcoal rounded-lg overflow-hidden">
                            <img
                              src={product.imageUrl || '/placeholder-product.jpg'}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-neon-green font-semibold">
                              ${product.price}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mb-8">
            <h3 className="font-semibold text-white mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="gaming-card">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-electric">
                    {products?.total || 0}
                  </p>
                  <p className="text-xs text-gray-400">Products</p>
                </CardContent>
              </Card>
              <Card className="gaming-card">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-neon-green">
                    {cartItemCount}
                  </p>
                  <p className="text-xs text-gray-400">In Cart</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!isAuthenticated ? (
              <Button 
                onClick={() => {
                  window.location.assign('/api/login');
                }}
                className="w-full bg-electric text-deep-black hover:bg-electric/80"
              >
                Sign In
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = '/api/logout'}
                variant="outline"
                className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}