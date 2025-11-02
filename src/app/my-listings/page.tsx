'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Trash2, Edit, Eye, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useProductsStore, Product } from '@/lib/store'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'

// Simple user ID generation that persists
const getCurrentUserId = () => {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('current_user_id')
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('current_user_id', userId)
    }
    return userId
  }
  // Fallback for server-side rendering or production issues
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export default function MyListingsPage() {
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { getMyProducts, removeProduct, fetchProducts, products } = useProductsStore()

  // Get the current user ID
  const currentUserId = getCurrentUserId()

  useEffect(() => {
    fetchMyProducts()
  }, [])

  const fetchMyProducts = async () => {
    try {
      // Fetch all products from database
      await fetchProducts()
      // Get ALL products (not just current user's)
      setMyProducts(products)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveProduct = async (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to remove "${productName}" from your listings?`)) {
      try {
        await removeProduct(productId)
        setMyProducts(prev => prev.filter(product => product.id !== productId))
        toast.success('Product removed successfully')
      } catch (error) {
        console.error('Error removing product:', error)
        toast.error('Failed to remove product')
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </div>
    )
  }

  if (myProducts.length === 0) {
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
              <h1 className="text-2xl font-bold text-gray-900 ml-4">All Listings</h1>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-16 w-16 text-gray-300" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No listings yet</h2>
            <p className="text-lg text-gray-500 mb-8">No products have been listed yet</p>
            <Link href="/sell">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white">
                List Your First Product
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
                  Back to Shop
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 ml-4">All Listings</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {myProducts.length} {myProducts.length === 1 ? 'listing' : 'listings'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage all rental listings
          </h2>
          <Link href="/sell">
            <Button className="bg-black hover:bg-gray-800 text-white">
              Add New Listing
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={product.images[0] || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-white/90 text-gray-700">
                    {product.category}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">per day</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Listed on</p>
                    <p className="text-sm font-medium">
                      {formatDate(product.created_at)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      by {product.seller_id}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/product/${product.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => {
                      // Edit functionality could be added here
                      toast('Edit functionality coming soon!')
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    onClick={() => handleRemoveProduct(product.id, product.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {myProducts.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📊 Listing Management</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• View all products listed on the platform</li>
              <li>• Remove any listings that are no longer available</li>
              <li>• Edit functionality coming soon</li>
              <li>• Contact information is displayed for each listing</li>
              <li>• All listings are sorted by creation date (newest first)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
