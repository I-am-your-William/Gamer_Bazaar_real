import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, LogOut, Package, Users, BarChart3, QrCode } from 'lucide-react';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useQuery } from '@tanstack/react-query';
import type { CartItemWithProduct } from '@/lib/types';

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useLocalAuth();
  const isAuthenticated = !!user;

  const { data: cartItems } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const cartItemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const isAdmin = user?.role === 'admin' || user?.id === 'admin';

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-electric rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-black font-bold" />
            </div>
            <span className="text-xl font-bold text-white">Gaming Paradise</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/products"
              className={`text-gray-300 hover:text-white transition-colors ${
                location.startsWith('/products') ? 'text-electric' : ''
              }`}
            >
              Products
            </Link>
            <Link
              href="/verify"
              className={`text-gray-300 hover:text-white transition-colors ${
                location === '/verify' ? 'text-electric' : ''
              }`}
            >
              Verify
            </Link>
            <Link
              href="/qr-scanner"
              className={`text-gray-300 hover:text-white transition-colors ${
                location === '/qr-scanner' ? 'text-electric' : ''
              }`}
            >
              QR Scanner
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-white">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-electric text-black text-xs min-w-[1.25rem] h-5">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Admin Links */}
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <Link href="/admin">
                      <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                    <Link href="/admin/inventory">
                      <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                        <Package className="h-4 w-4 mr-2" />
                        Inventory
                      </Button>
                    </Link>
                  </div>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm">
                    Welcome, {user.firstName || user.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/auth">
                <Button className="bg-electric hover:bg-electric/80 text-black">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}