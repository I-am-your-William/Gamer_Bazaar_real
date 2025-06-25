import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductGrid from '@/components/products/product-grid';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Landing() {
  const [verificationCode, setVerificationCode] = useState('');

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products', { limit: 8 }],
    queryFn: () => fetch('/api/products?limit=8').then(res => res.json()),
    staleTime: 0, // Fresh data to show new products
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const featuredProducts = productsData?.products || [];
  const productCategories = categories || [];
  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-electric/10 to-neon-green/10"></div>
          <div className="absolute top-10 left-10 w-32 h-32 border border-electric/30 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border border-neon-green/20 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-orbitron font-black text-5xl lg:text-7xl mb-6 leading-tight">
                Level up your gaming experience
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-neon-green block">
                  in one click
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Discover premium gaming equipment with authentic QR verification. 
                Every product comes with a unique digital certificate for guaranteed authenticity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-gradient-to-r from-electric to-neon-green text-deep-black px-8 py-4 rounded-full font-bold text-lg hover:shadow-neon-glow transition-all duration-300 animate-glow"
                  onClick={() => window.location.href = '/api/login'}
                >
                  SIGN IN WITH GOOGLE
                </Button>
                <Link href="/products">
                  <Button 
                    variant="outline" 
                    className="border-2 border-electric text-electric px-8 py-4 rounded-full font-bold text-lg hover:bg-electric hover:text-deep-black transition-all duration-300"
                  >
                    BROWSE PRODUCTS
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Gaming PC Setup" 
                className="rounded-2xl shadow-2xl gaming-card transform hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute -bottom-4 -right-4 bg-neon-green text-deep-black px-4 py-2 rounded-full font-bold">
                ✓ QR VERIFIED
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-charcoal/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-4xl mb-4 neon-text">FEATURED CATEGORIES</h2>
            <p className="text-gray-400 text-lg">Explore our premium gaming equipment collections</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-800 h-48 rounded-xl mb-4"></div>
                  <div className="bg-gray-800 h-6 rounded mb-2"></div>
                  <div className="bg-gray-800 h-4 rounded"></div>
                </div>
              ))
            ) : (
              productCategories.slice(0, 3).map((category: any) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="gaming-card rounded-2xl p-6 group cursor-pointer transition-all duration-300 hover:shadow-neon">
                  <div className="relative mb-6">
                    <img 
                      src={category.imageUrl || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
                      alt={category.name} 
                      className="w-full h-48 object-cover rounded-xl" 
                    />
                    <Badge className="absolute top-4 right-4 bg-electric text-deep-black">
                      NEW
                    </Badge>
                  </div>
                  <h3 className="font-orbitron font-bold text-xl mb-2 group-hover:text-electric transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-400 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-neon-green font-bold">From $99</span>
                    <div className="text-electric group-hover:translate-x-2 transition-transform">→</div>
                  </div>
                </Card>
              </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-deep-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-4xl mb-4 neon-text">TRENDING PRODUCTS</h2>
            <p className="text-gray-400 text-lg">Most popular gaming gear this month</p>
          </div>
          
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      {/* QR Verification Section */}
      <section className="py-20 bg-gradient-to-r from-charcoal to-dark-gray" id="qr-verification">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <h2 className="font-orbitron font-bold text-4xl mb-6 neon-text">PRODUCT AUTHENTICATION</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Verify the authenticity of your gaming equipment with our advanced QR code system. 
                Each product comes with a unique digital certificate.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Card className="gaming-card p-6 rounded-2xl">
                  <h3 className="font-orbitron font-bold text-xl mb-4 text-electric">SCAN QR CODE</h3>
                  <div className="bg-white p-4 rounded-xl inline-block mb-4">
                    <div className="w-32 h-32 bg-black flex items-center justify-center text-white text-xs">
                      QR CODE
                    </div>
                  </div>
                  <p className="text-gray-400">Use your phone camera to scan the QR code on your product packaging</p>
                </Card>
                
                <Card className="gaming-card p-6 rounded-2xl">
                  <h3 className="font-orbitron font-bold text-xl mb-4 text-neon-green">MANUAL VERIFICATION</h3>
                  <div className="space-y-4">
                    <Input 
                      type="text" 
                      placeholder="Enter product verification code" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full bg-deep-black border border-electric/30 rounded-lg px-4 py-3 text-white focus:border-electric"
                    />
                    <Link href={`/verify/${verificationCode}`}>
                      <Button className="w-full bg-electric text-deep-black font-bold py-3 rounded-lg hover:bg-electric/80 transition-colors">
                        VERIFY PRODUCT
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card className="gaming-card p-6 rounded-2xl border-neon-green border-2">
                  <div className="flex items-center mb-4">
                    <div className="text-neon-green text-2xl mr-3">✓</div>
                    <h3 className="font-orbitron font-bold text-xl text-neon-green">VERIFICATION FEATURES</h3>
                  </div>
                  <div className="text-left space-y-3">
                    <div className="flex items-center">
                      <div className="text-electric mr-2">🛡️</div>
                      <span>Tamper-proof QR codes</span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-neon-green mr-2">📜</div>
                      <span>Digital certificates</span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-gaming-purple mr-2">📧</div>
                      <span>Email confirmations</span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-gaming-orange mr-2">🔗</div>
                      <span>Blockchain verified</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
