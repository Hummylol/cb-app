'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 2000))
    clearCart()
    setIsCheckingOut(false)
    toast.success('Order placed successfully!')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b sticky top-0 z-50">
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
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven&apos;t added any items to your cart yet</p>
            <Link href="/">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Continue Shopping</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                {items.length} items
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="border">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Your Items</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearCart()
                      toast.success('Cart cleared')
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">
                            ₹{item.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{item.price.toFixed(2)} each
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between sm:justify-end space-x-4">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Total and Remove */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                removeItem(item.product_id)
                                toast.success('Item removed from cart')
                              }}
                              className="text-gray-600 hover:text-gray-800 mt-1"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Remove</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border sticky top-24">
              <CardHeader className="bg-gray-900 text-white">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.reduce((total, item) => total + item.quantity, 0)} items)</span>
                    <span className="font-semibold">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-gray-600">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-semibold">₹0.00</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full h-12 text-lg font-semibold bg-black hover:bg-gray-800 text-white"
                  size="lg"
                >
                  {isCheckingOut ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Checkout Now
                    </div>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  Secure checkout
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
