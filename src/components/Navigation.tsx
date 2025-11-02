'use client'

import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Heart, Menu, Plus, List, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    <header className="bg-white shadow-sm rounded-b-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 hidden sm:block">ShopNow</span>
          </Link>

          {/* Desktop Search */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="md:flex  items-center space-x-4">
            {isSeller && (
              <Link href="/sell">
                <Button variant="ghost" size="sm">
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline ml-1">Sell</span>
                </Button>
              </Link>
            )}
            <Link href="/wishlist">
              <Button variant="ghost" size="sm" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>
            {user ? (
              <Button
                className='hidden md:flex items-center gap-2'
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            ) : (
              <>
                <Link href="/login" className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup" className="hidden md:block">
                  <Button variant="default" size="sm">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-4">
              {isSeller && (
                <Link href="/sell" className="block">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Plus className="h-5 w-5 mr-2" />
                    Sell Product
                  </Button>
                </Link>
              )}
              <div className="flex items-center space-x-4">
                <Link href="/wishlist" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full relative">
                    <Heart className="h-5 w-5 mr-2" />
                    Wishlist
                    {wishlistItems.length > 0 && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs">
                        {wishlistItems.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/cart" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full relative">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Cart
                    {getTotalItems() > 0 && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
              <Link href="/my-listings" className="block">
                <Button variant="ghost" size="sm" className="w-full">
                  <List className="h-5 w-5 mr-2" />
                  All Listings
                </Button>
              </Link>
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign out
                </Button>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button variant="ghost" size="sm" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup" className="block">
                    <Button variant="default" size="sm" className="w-full">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
