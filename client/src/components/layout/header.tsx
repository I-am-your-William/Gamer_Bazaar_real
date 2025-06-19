import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import CartSidebar from '@/components/cart/cart-sidebar';
import { Menu, Search, ShoppingCart, User, Heart } from 'lucide-react';

export default function Header() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const { data: cartItems } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const cartCount = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const navItems = [
    { href: '/products?category=gaming-pcs', label: 'Gaming PCs' },
    { href: '/products?category=laptops', label: 'Laptops' },
    { href: '/products?category=accessories', label: 'Accessories' },
    { href: '/products?category=components', label: 'Components' },
  ];

  return (
    <>
      <header className="bg-charcoal/95 backdrop-blur-sm border-b border-electric/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-r from-electric to-neon-green rounded-lg flex items-center justify-center">
                  <span className="text-deep-black font-bold text-xl">🎮</span>
                </div>
                <span className="font-orbitron font-bold text-xl neon-text">GAMERS BAZAAR</span>
              </div>
            </Link>
            
            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className="hover:text-electric transition-colors cursor-pointer">
                    {item.label}
                  </span>
                </Link>
              ))}
              {isAuthenticated && user?.role === 'admin' && (
                <Link href="/admin">
                  <span className="hover:text-gaming-orange transition-colors cursor-pointer">
                    Admin
                  </span>
                </Link>
              )}
            </nav>
            
            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center bg-dark-gray rounded-full px-4 py-2 w-96">
              <Input 
                type="text" 
                placeholder="Search gaming gear..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-transparent border-none outline-none text-sm flex-1"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSearch}
                className="p-0 h-auto hover:bg-transparent"
              >
                <Search className="h-4 w-4 text-electric" />
              </Button>
            </div>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Search - Mobile */}
              <div className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {/* Wishlist */}
              {isAuthenticated && (
                <Button variant="ghost" size="sm" className="hover:text-electric">
                  <Heart className="h-5 w-5" />
                </Button>
              )}

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:text-electric"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-neon-green text-deep-black rounded-full w-5 h-5 text-xs flex items-center justify-center p-0">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                      <span className="hidden md:inline">
                        {user?.firstName || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-charcoal border-electric/20">
                    <DropdownMenuItem asChild>
                      <Link href="/orders">Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/verify">Verify Product</Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  className="bg-electric text-deep-black px-4 py-2 rounded-full font-medium hover:bg-electric/80 transition-colors"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-charcoal border-electric/20">
                    <div className="flex flex-col space-y-4 mt-8">
                      {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <span className="block py-2 text-lg hover:text-electric transition-colors">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                      {isAuthenticated && user?.role === 'admin' && (
                        <Link href="/admin">
                          <span className="block py-2 text-lg hover:text-gaming-orange transition-colors">
                            Admin
                          </span>
                        </Link>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
