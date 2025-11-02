'use client'

import React from 'react'
import { Heart, ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWishlistStore } from '@/lib/store'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const { addItem } = useCartStore()

  const handleAddToCart = (item: { id: string; product_id: string; title: string; price: number; image: string }) => {
    addItem({
      id: item.id,
      product_id: item.product_id,
      title: item.title,
      price: item.price,
      image: item.image
    })
    toast.success('Added to cart')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shop
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-16 w-16 text-gray-300" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-lg text-gray-500 mb-8">Save items you love for later by adding them to your wishlist</p>
            <Link href="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {items.length} items
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearWishlist()
              toast.success('Wishlist cleared')
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <Link href={`/product/${item.product_id}`}>
                <div className="aspect-square relative overflow-hidden cursor-pointer">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white text-red-500"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeItem(item.product_id)
                      }}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </Link>
              
              <CardContent className="p-4">
                <Link href={`/product/${item.product_id}`}>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                    {item.title}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardContent className="p-4 pt-0">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 group-hover:bg-blue-600 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        removeItem(item.product_id)
                        toast.success('Removed from wishlist')
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

