'use client'

import { useState, useEffect } from 'react'
import { Filter, Search, X, ArrowRight, Laptop, Shirt, BookOpen, Home as HomeIcon, Trophy, Sparkles, Gamepad2, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore, useProductsStore, Product } from '@/lib/store'
import Navigation from '@/components/Navigation'
import ProductCard from '@/components/ProductCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('newest')
  const { addItem } = useCartStore()
  const { fetchProducts, products, loading } = useProductsStore()

  const categories = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'electronics', label: 'Electronics', icon: Laptop },
    { id: 'clothing', label: 'Clothing', icon: Shirt },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'beauty', label: 'Beauty', icon: Sparkles },
    { id: 'toys', label: 'Toys', icon: Gamepad2 },
  ]

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Refresh products when page becomes visible (e.g., when returning from sell page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProducts()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchProducts])

  // Remove the local fetchProducts function since we're using the store's fetchProducts

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesPriceMin = !priceRange.min || product.price >= parseFloat(priceRange.min)
    const matchesPriceMax = !priceRange.max || product.price <= parseFloat(priceRange.max)
    return matchesSearch && matchesCategory && matchesPriceMin && matchesPriceMax
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      product_id: product.id,
      title: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.svg'
    })
  }

  if (loading) {
    return <LoadingSpinner message="Loading products..." />
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fafafa]">
        <Navigation searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Header Spacer for Fixed Nav */}
        <div className="h-32" />

        {/* Category Section */}
        <section className="px-4 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  Explore <span className="text-blue-600">Categories</span>
                </h1>
                <p className="text-gray-400 font-bold text-sm hidden sm:block">
                  Discover {filteredProducts.length} items
                </p>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar items-center">
                {categories.map((category) => {
                  const Icon = category.icon
                  const isActive = selectedCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                        flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap border
                        ${isActive
                          ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                          : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-900'}
                      `}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span className="text-sm font-bold">{category.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>


        {/* Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                {selectedCategory === 'all' ? 'Popular Items' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
              </h2>
              <p className="text-gray-500 font-medium">Explore over {filteredProducts.length} premium products today.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group flex-1 md:w-64">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 appearance-none cursor-pointer hover:border-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-400" />
                </div>
              </div>

              <Button
                variant="outline"
                className={`h-12 w-12 rounded-2xl border-2 transition-all p-0 ${showFilters ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100'}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 mb-12">
              <div className="bg-white/60 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-gray-900">Customize Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full h-10 w-10 p-0 hover:bg-red-50 hover:text-red-500"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">
                      Price Range (₹)
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        type="number"
                        className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold"
                      />
                      <div className="h-[2px] w-4 bg-gray-200" />
                      <Input
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        type="number"
                        className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">
                      Sort Experience
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['newest', 'price-low', 'price-high', 'name'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSortBy(s)}
                          className={`
                            h-14 rounded-2xl text-xs font-bold capitalize transition-all
                            ${sortBy === s ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
                          `}
                        >
                          {s.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPriceRange({ min: '', max: '' })
                        setSortBy('newest')
                      }}
                      className="w-full h-14 border-2 border-gray-100 hover:border-red-500 hover:text-red-500 rounded-2xl font-bold transition-all"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-32 flex flex-col items-center text-center max-w-md mx-auto">
              <div className="w-32 h-32 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 animate-bounce">
                <Search className="h-14 w-14 text-gray-300" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Everything is Gone!</h3>
              <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                We couldn&apos;t find any products matching your current filters. Try expanding your search criteria!
              </p>
              <Button
                size="lg"
                className="h-16 px-10 rounded-2xl bg-blue-600 text-white font-black shadow-2xl shadow-blue-200"
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setPriceRange({ min: '', max: '' }); }}
              >
                Clear Everything
              </Button>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white rounded-t-[4rem]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <span className="text-2xl font-extrabold tracking-tighter">ShopNow</span>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed">
                  Redefining the online shopping experience with premium design and trusted service.
                </p>
                <div className="flex gap-4">
                  {/* Social links placeholder */}
                  <div className="h-10 w-10 bg-gray-800 rounded-xl" />
                  <div className="h-10 w-10 bg-gray-800 rounded-xl" />
                  <div className="h-10 w-10 bg-gray-800 rounded-xl" />
                </div>
              </div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-gray-500">Shop Deep</h4>
                <ul className="space-y-4 text-gray-400 font-bold">
                  <li><a href="#" className="hover:text-white transition-colors">All Products</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Featured Items</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Flash Sales</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Collections</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-gray-500">Help & Support</h4>
                <ul className="space-y-4 text-gray-400 font-bold">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-gray-500">Newsletter</h4>
                <p className="text-gray-400 font-bold mb-6">Stay updated with our latest offers.</p>
                <div className="flex gap-2">
                  <Input className="bg-white/5 border-none h-14 rounded-2xl text-white font-bold" placeholder="Your email" />
                  <Button className="h-14 w-14 rounded-2xl bg-blue-600 text-white shrink-0">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-gray-500 font-bold">&copy; 2024 ShopNow. All rights reserved.</p>
              <div className="flex gap-8 text-gray-500 font-bold text-sm">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
                <a href="#" className="hover:text-white">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}