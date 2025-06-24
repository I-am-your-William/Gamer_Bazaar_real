import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductGrid from '@/components/products/product-grid';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const { user } = useAuth();

  const { data: productsData } = useQuery({
    queryKey: ['/api/products', { limit: 8 }],
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
  });

  const { data: qrCodes } = useQuery({
    queryKey: ['/api/qr-codes'],
  });

  const featuredProducts = productsData?.products || [];
  const recentOrders = orders?.slice(0, 3) || [];
  const recentQrCodes = qrCodes?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <Header />
      
      {/* Welcome Section */}
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-orbitron font-bold text-4xl lg:text-6xl mb-4">
              Welcome back, <span className="text-electric">{user?.firstName || 'Gamer'}</span>!
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Ready to upgrade your gaming setup?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button className="bg-gradient-to-r from-electric to-neon-green text-deep-black px-8 py-4 rounded-full font-bold text-lg">
                  BROWSE PRODUCTS
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="outline" className="border-electric text-electric px-8 py-4 rounded-full font-bold text-lg">
                  VIEW CART
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Overview */}
      <section className="py-16 bg-charcoal/30">
        <div className="container mx-auto px-4">
          <h2 className="font-orbitron font-bold text-3xl mb-8 text-center">Your Gaming Dashboard</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center text-electric">
                  <span className="mr-2">📦</span>
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => (
                      <div key={order.id} className="flex justify-between items-center p-3 bg-deep-black rounded-lg">
                        <div>
                          <p className="font-semibold">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-400">${order.totalAmount}</p>
                        </div>
                        <Badge className={`${
                          order.status === 'delivered' ? 'bg-neon-green' :
                          order.status === 'shipped' ? 'bg-gaming-purple' :
                          order.status === 'processing' ? 'bg-electric' :
                          'bg-gaming-orange'
                        } text-deep-black`}>
                          {order.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No orders yet</p>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => navigate('/orders')}>
                    View All Orders
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center text-neon-green">
                  <span className="mr-2">🔍</span>
                  QR Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQrCodes.length > 0 ? (
                    recentQrCodes.map((qr: any) => (
                      <div key={qr.id} className="flex justify-between items-center p-3 bg-deep-black rounded-lg">
                        <div>
                          <p className="font-semibold text-sm">{qr.product.name}</p>
                          <p className="text-xs text-gray-400">{qr.serialNumber}</p>
                        </div>
                        <Badge className={qr.isVerified ? 'bg-neon-green text-deep-black' : 'bg-gaming-orange text-white'}>
                          {qr.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No QR codes yet</p>
                  )}
                  <Link href="/verify">
                    <Button variant="outline" className="w-full">Verify Product</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center text-gaming-purple">
                  <span className="mr-2">🎮</span>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/products?category=gaming-pcs">
                    <Button variant="outline" className="w-full justify-start">
                      <span className="mr-2">🖥️</span>
                      Browse Gaming PCs
                    </Button>
                  </Link>
                  <Link href="/products?category=accessories">
                    <Button variant="outline" className="w-full justify-start">
                      <span className="mr-2">🎧</span>
                      Gaming Accessories
                    </Button>
                  </Link>
                  <Link href="/verify">
                    <Button variant="outline" className="w-full justify-start">
                      <span className="mr-2">📱</span>
                      Scan QR Code
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-deep-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-orbitron font-bold text-3xl mb-4 neon-text">RECOMMENDED FOR YOU</h2>
            <p className="text-gray-400 text-lg">Handpicked gaming gear based on your preferences</p>
          </div>
          
          <ProductGrid products={featuredProducts} />
          
          <div className="text-center mt-8">
            <Link href="/products">
              <Button className="bg-electric text-deep-black px-8 py-3 rounded-full font-bold">
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
