import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  QrCode, 
  Settings, 
  Users,
  BarChart3,
  LogOut,
  Home
} from 'lucide-react';

export default function AdminSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/admin/inventory',
      label: 'Inventory',
      icon: Package,
    },
    {
      href: '/admin/orders',
      label: 'Orders',
      icon: ShoppingCart,
    },
    {
      href: '/admin/qr-management',
      label: 'QR Management',
      icon: QrCode,
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      href: '/admin/customers',
      label: 'Customers',
      icon: Users,
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const isActivePath = (href: string, exact = false) => {
    if (exact) {
      return location === href;
    }
    return location.startsWith(href);
  };

  return (
    <div className="w-64 bg-charcoal border-r border-electric/20 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-electric/20">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-electric to-neon-green rounded-lg flex items-center justify-center">
              <span className="text-deep-black font-bold text-lg">🎮</span>
            </div>
            <div>
              <span className="font-orbitron font-bold text-lg neon-text">GAMERS</span>
              <div className="text-xs text-electric font-semibold">ADMIN PANEL</div>
            </div>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-electric/20">
        <div className="flex items-center space-x-3">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-electric/20 rounded-full flex items-center justify-center">
              <span className="text-electric font-bold">
                {user?.firstName?.charAt(0) || 'A'}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-electric">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.href, item.exact);
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-200 ${
                    isActive 
                      ? 'bg-electric text-deep-black hover:bg-electric/80' 
                      : 'text-gray-300 hover:text-white hover:bg-electric/10'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-electric/20">
        <div className="space-y-2">
          <Link href="/">
            <Button
              variant="outline"
              className="w-full justify-start border-electric/30 text-electric hover:bg-electric hover:text-deep-black"
            >
              <Home className="h-4 w-4 mr-3" />
              View Store
            </Button>
          </Link>
          
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-electric/20">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 Gamers Bazaar
          </p>
          <p className="text-xs text-gray-600">
            Admin Dashboard v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
