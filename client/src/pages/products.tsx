import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductGrid from '@/components/products/product-grid';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function Products() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 12;

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    setSearchQuery(params.get('search') || '');
    setSelectedCategory(params.get('category') || '');
  }, [location]);

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['/api/products', { 
      category: selectedCategory, 
      search: searchQuery,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage 
    }],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      });
      return fetch(`/api/products?${params}`).then(res => res.json());
    },
    staleTime: 0,
  });

  const products = productsData?.products || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    const categoryValue = category === 'all' ? '' : category;
    setSelectedCategory(categoryValue);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-orbitron font-bold text-4xl lg:text-6xl mb-4">
              GAMING <span className="text-electric">ARSENAL</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover premium gaming equipment with QR authentication
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-charcoal/30 border-b border-electric/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex items-center bg-dark-gray rounded-full px-4 py-2 w-full lg:w-96">
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

            {/* Filters */}
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48 bg-dark-gray border-electric/30">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-electric/20">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-dark-gray border-electric/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-electric/20">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="border-electric/30 text-electric hover:bg-electric hover:text-deep-black"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-gray-400">Active filters:</span>
              {searchQuery && (
                <Badge variant="outline" className="border-electric text-electric">
                  Search: {searchQuery}
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="outline" className="border-neon-green text-neon-green">
                  Category: {categories?.find((c: any) => c.slug === selectedCategory)?.name}
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : 
                 selectedCategory ? categories?.find((c: any) => c.slug === selectedCategory)?.name : 
                 'All Products'}
              </h2>
              <p className="text-gray-400">
                Showing {products.length} of {totalProducts} products
              </p>
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid products={products} loading={isLoading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12 space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-electric/30"
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 
                      "bg-electric text-deep-black" : 
                      "border-electric/30 text-electric hover:bg-electric hover:text-deep-black"
                    }
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-electric/30"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
