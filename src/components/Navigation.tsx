'use client'

import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Heart, Menu, Plus, List, LogOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore, useWishlistStore } from '@/lib/store'
import { useAuthStore } from '@/lib/auth-store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavigationProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export default function Navigation({ searchTerm, setSearchTerm }: NavigationProps) {
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { getTotalItems } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const { user, signOut, checkAuth } = useAuthStore()
  const [isSeller, setIsSeller] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    setIsSeller(user?.role === 'seller' || user?.role === 'both')
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    setShowMobileMenu(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-4 mt-4">
        <div className="max-w-7xl mx-auto backdrop-blur-md bg-white/70 border border-white/20 shadow-lg rounded-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 hidden sm:block">
                ShopNow
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {isSeller && (
                <Link href="/sell">
                  <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 hover:bg-blue-50 transition-colors rounded-xl">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <span>Sell</span>
                  </Button>
                </Link>
              )}
              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="relative hover:bg-red-50 transition-colors rounded-xl p-2">
                  <Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in zoom-in">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 transition-colors rounded-xl p-2">
                  <ShoppingCart className="h-5 w-5 text-gray-600 hover:text-blue-600 transition-colors" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in zoom-in">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </Link>
              {user ? (
                <Button
                  className='hidden md:flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl'
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </Button>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="rounded-xl">Sign in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-md rounded-xl">Sign up</Button>
                  </Link>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden rounded-xl p-2"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`
        fixed inset-x-4 top-24 z-40 md:hidden transition-all duration-300 transform
        ${showMobileMenu ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'}
      `}>
        <div className="backdrop-blur-xl bg-white/90 border border-white/20 shadow-2xl rounded-3xl overflow-hidden p-6 space-y-6">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-100/50 border-none focus:bg-white rounded-2xl h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isSeller && (
              <Link href="/sell" onClick={() => setShowMobileMenu(false)} className="col-span-2">
                <Button variant="default" className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg rounded-2xl flex items-center justify-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span>Sell Product</span>
                </Button>
              </Link>
            )}
            <Link href="/wishlist" onClick={() => setShowMobileMenu(false)}>
              <Button variant="outline" className="w-full h-14 bg-white/50 border-white/20 shadow-sm rounded-2xl flex flex-col items-center justify-center gap-1 group">
                <Heart className="h-5 w-5 text-gray-600 group-hover:text-red-500" />
                <span className="text-[10px] font-medium text-gray-600">Wishlist</span>
              </Button>
            </Link>
            <Link href="/cart" onClick={() => setShowMobileMenu(false)}>
              <Button variant="outline" className="w-full h-14 bg-white/50 border-white/20 shadow-sm rounded-2xl flex flex-col items-center justify-center gap-1 group">
                <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                <span className="text-[10px] font-medium text-gray-600">Cart</span>
              </Button>
            </Link>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <Link href="/my-listings" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
              <List className="h-5 w-5" />
              <span className="font-medium">My Listings</span>
            </Link>
            {user ? (
              <button
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-xl transition-colors text-left"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/login" onClick={() => setShowMobileMenu(false)}>
                  <Button variant="ghost" className="w-full rounded-xl">Log In</Button>
                </Link>
                <Link href="/signup" onClick={() => setShowMobileMenu(false)}>
                  <Button variant="default" className="w-full rounded-xl bg-gray-900">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
