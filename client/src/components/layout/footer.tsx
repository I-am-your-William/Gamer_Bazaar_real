import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubscribe = () => {
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-deep-black border-t border-electric/20 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-electric to-neon-green rounded-lg flex items-center justify-center">
                <span className="text-deep-black font-bold text-xl">🎮</span>
              </div>
              <span className="font-orbitron font-bold text-xl neon-text">GAMERS BAZAAR</span>
            </div>
            <p className="text-gray-400 mb-6">
              Premium gaming equipment with guaranteed authenticity through advanced QR verification.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: '🐦', href: '#', label: 'Twitter' },
                { icon: '📘', href: '#', label: 'Facebook' },
                { icon: '📷', href: '#', label: 'Instagram' },
                { icon: '💬', href: '#', label: 'Discord' },
              ].map((social) => (
                <a 
                  key={social.label}
                  href={social.href} 
                  className="w-10 h-10 bg-dark-gray rounded-full flex items-center justify-center hover:bg-electric hover:text-deep-black transition-colors text-lg"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Products */}
          <div>
            <h4 className="font-orbitron font-bold text-lg mb-6">PRODUCTS</h4>
            <ul className="space-y-3 text-gray-400">
              {[
                { href: '/products', label: 'Gaming PCs' },
                { href: '/products', label: 'Gaming Laptops' },
                { href: '/products', label: 'Keyboards & Mice' },
                { href: '/products', label: 'Headsets' },
                { href: '/products', label: 'Monitors' },
                { href: '/products', label: 'Gaming Chairs' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className="hover:text-electric transition-colors cursor-pointer">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-orbitron font-bold text-lg mb-6">SUPPORT</h4>
            <ul className="space-y-3 text-gray-400">
              {[
                { href: '/verify', label: 'Product Verification' },
                { href: '/qr-scanner', label: 'QR Scanner' },
                { href: '/orders', label: 'Order Tracking' },
                { href: '/products', label: 'Browse Products' },
                { href: '/auth', label: 'Account Login' },
                { href: '/', label: 'Help Center' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className="hover:text-electric transition-colors cursor-pointer">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="font-orbitron font-bold text-lg mb-6">STAY UPDATED</h4>
            <p className="text-gray-400 mb-4">
              Get the latest gaming gear releases and exclusive offers.
            </p>
            <div className="space-y-3">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-gray border border-electric/30 rounded-lg px-4 py-3 text-white focus:border-electric"
              />
              <Button 
                onClick={handleNewsletterSubscribe}
                className="w-full bg-gradient-to-r from-electric to-neon-green text-deep-black font-bold py-3 rounded-lg hover:shadow-neon-glow transition-all"
              >
                SUBSCRIBE
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-electric/20 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Gamers Bazaar. All rights reserved. | QR Authentication Technology by Gamers Bazaar</p>
        </div>
      </div>
    </footer>
  );
}
