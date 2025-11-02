'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingCart, Star, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCartStore, useWishlistStore, useProductsStore, Product } from '@/lib/store'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [rentalPeriod, setRentalPeriod] = useState('daily')
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addItem } = useCartStore()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  const { fetchProducts, products } = useProductsStore()
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      // First try to find in local state
      let foundProduct = products.find(p => p.id === id)
      
      // If not found, fetch from database
      if (!foundProduct) {
        await fetchProducts()
        foundProduct = products.find(p => p.id === id)
      }
      
      setProduct(foundProduct || null)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (product) {
      setIsAddingToCart(true)
      // Simulate adding to cart
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Calculate price based on rental period
      let finalPrice = product.price
      let periodText = 'day'
      
      switch (rentalPeriod) {
        case 'weekly':
          finalPrice = product.price * 7 * 0.8 // 20% discount
          periodText = 'week'
          break
        case 'monthly':
          finalPrice = product.price * 30 * 0.7 // 30% discount
          periodText = 'month'
          break
        default:
          finalPrice = product.price
          periodText = 'day'
      }
      
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          product_id: product.id,
          title: `${product.name} (${rentalPeriod} rental)`,
          price: finalPrice,
          image: product.images[0] || '/placeholder.svg'
        })
      }
      setIsAddingToCart(false)
      toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart (${rentalPeriod} rental)`)
    }
  }

  const handleWishlistToggle = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id)
        toast.success('Removed from wishlist')
      } else {
        addToWishlist({
          id: product.id,
          product_id: product.id,
          title: product.name,
          price: product.price,
          image: product.images[0] || '/placeholder.svg',
          category: product.category
        })
        toast.success('Added to wishlist')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-16 w-16 text-gray-300" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product not found</h1>
          <p className="text-lg text-gray-500 mb-8">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    )
  }

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-xl overflow-hidden shadow-lg">
              <Image
                src={product.images[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {product.category}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleWishlistToggle}
                    className={isInWishlist(product.id) ? 'text-red-500' : 'text-gray-500'}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">(4.8) 124 reviews</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  In Stock
                </Badge>
              </div>
              
              <div className="flex items-baseline space-x-3 mb-6">
                <p className="text-4xl font-bold text-green-600">
                  ₹{product.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  per day
                </p>
              </div>
              
              {/* Additional Rental Options */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3">Additional Rental Options</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="text-sm text-blue-700 mb-1">Weekly Rate</div>
                    <div className="text-lg font-bold text-blue-900">
                      ₹{(product.price * 7 * 0.8).toFixed(2)}
                    </div>
                    <div className="text-xs text-blue-600">Save 20%</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="text-sm text-blue-700 mb-1">Monthly Rate</div>
                    <div className="text-lg font-bold text-blue-900">
                      ₹{(product.price * 30 * 0.7).toFixed(2)}
                    </div>
                    <div className="text-xs text-blue-600">Save 30%</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="text-sm text-blue-700 mb-1">Security Deposit</div>
                    <div className="text-lg font-bold text-blue-900">
                      ₹{(product.price * 2).toFixed(2)}
                    </div>
                    <div className="text-xs text-blue-600">Refundable</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-blue-700">
                  💡 Longer rental periods offer better value. Security deposit is fully refundable upon return.
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
            </div>

            <div className="space-y-6">
              {/* Rental Period Selection */}
              <div>
                <span className="text-lg font-medium text-gray-700 mb-3 block">Rental Period:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setRentalPeriod('daily')}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      rentalPeriod === 'daily'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">Daily</div>
                    <div className="text-xs opacity-75">₹{product.price.toFixed(2)}/day</div>
                  </button>
                  <button
                    onClick={() => setRentalPeriod('weekly')}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      rentalPeriod === 'weekly'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">Weekly</div>
                    <div className="text-xs opacity-75">₹{(product.price * 7 * 0.8).toFixed(2)}/week</div>
                  </button>
                  <button
                    onClick={() => setRentalPeriod('monthly')}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      rentalPeriod === 'monthly'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">Monthly</div>
                    <div className="text-xs opacity-75">₹{(product.price * 30 * 0.7).toFixed(2)}/month</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="h-10 w-10"
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock_quantity} available
                </span>
              </div>

              {/* Total Price Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">Total Price:</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{(() => {
                        let totalPrice = product.price * quantity
                        switch (rentalPeriod) {
                          case 'weekly':
                            totalPrice = product.price * 7 * 0.8 * quantity
                            break
                          case 'monthly':
                            totalPrice = product.price * 30 * 0.7 * quantity
                            break
                        }
                        return totalPrice.toFixed(2)
                      })()}
                    </div>
                    <div className="text-sm text-gray-500">
                      for {quantity} {quantity === 1 ? 'item' : 'items'} ({rentalPeriod})
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || isAddingToCart}
                  className="flex-1 h-12 text-lg font-semibold"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </div>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className={`h-12 w-12 ${isInWishlist(product.id) ? 'text-red-500 border-red-200' : ''}`}
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Rental Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Truck className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Pickup Available</p>
                  <p className="text-sm text-green-700">Flexible pickup options</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Secure Rental</p>
                  <p className="text-sm text-blue-700">Safe and reliable service</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <RotateCcw className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-900">Easy Return</p>
                  <p className="text-sm text-purple-700">Convenient return process</p>
                </div>
              </div>
            </div>

            {/* Product Details Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Category</span>
                    <p className="font-medium capitalize">{product.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Availability</span>
                    <p className="font-medium">{product.stock_quantity > 0 ? 'Available' : 'Unavailable'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Contact</span>
                    <p className="font-medium">{product.contact_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Listed</span>
                    <p className="font-medium">{new Date(product.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {product.additional_details && (
                  <div>
                    <span className="text-gray-600">Additional Details</span>
                    <p className="font-medium mt-1">{product.additional_details}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

