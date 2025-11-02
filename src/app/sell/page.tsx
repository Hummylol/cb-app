'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Camera, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useProductsStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/auth-store'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useRouter } from 'next/navigation'

interface ProductForm {
  name: string
  description: string
  category: string
  price: string
  rentalPrice: string
  contactNumber: string
  additionalDetails: string
  images: File[]
  imagePreviews: string[]
}

const categories = [
  'electronics',
  'clothing',
  'books',
  'home',
  'sports',
  'beauty',
  'toys',
  'furniture',
  'automotive',
  'other'
]

export default function SellPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    category: '',
    price: '',
    rentalPrice: '',
    contactNumber: '',
    additionalDetails: '',
    images: [],
    imagePreviews: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addProduct } = useProductsStore()

  useEffect(() => {
    // Check if user is seller or both
    if (user && user.role !== 'seller' && user.role !== 'both') {
      toast.error('Only sellers can list products')
      router.push('/')
    }
  }, [user, router])

  const handleInputChange = (field: keyof ProductForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages = [...formData.images, ...files].slice(0, 5) // Max 5 images
    const newPreviews = newImages.map(file => URL.createObjectURL(file))
    
    setFormData(prev => ({
      ...prev,
      images: newImages,
      imagePreviews: newPreviews
    }))
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    const newPreviews = formData.imagePreviews.filter((_, i) => i !== index)
    
    setFormData(prev => ({
      ...prev,
      images: newImages,
      imagePreviews: newPreviews
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.contactNumber) {
        toast.error('Please fill in all required fields')
        return
      }

      if (formData.images.length === 0) {
        toast.error('Please upload at least one image')
        return
      }

      // Upload images to Supabase storage (with fallback)
      const imageUrls: string[] = []
      const userId = user?.id
      
      if (!userId) {
        toast.error('You must be logged in to list products')
        setIsSubmitting(false)
        return
      }
      
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here') {
        console.log('Supabase not configured, using base64 images...')
        // Convert to base64
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i]
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
          imageUrls.push(base64)
        }
      } else {
        try {
          for (let i = 0; i < formData.images.length; i++) {
            const file = formData.images[i]
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}/${Date.now()}_${i}.${fileExt}`
            
            const { data, error } = await supabase.storage
              .from('product-images')
              .upload(fileName, file)
            
            if (error) {
              console.error('Storage upload error:', error)
              throw error
            }
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName)
            
            imageUrls.push(publicUrl)
          }
        } catch (storageError) {
          console.error('Error uploading images to Supabase:', storageError)
          console.log('Falling back to base64 images...')
          
          // Fallback: Convert to base64
          for (let i = 0; i < formData.images.length; i++) {
            const file = formData.images[i]
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
            imageUrls.push(base64)
          }
        }
      }
      
      // Ensure we have a valid user ID
      const finalUserId = userId
      if (!finalUserId) {
        toast.error('User ID not found')
        setIsSubmitting(false)
        return
      }
      console.log('Using seller_id:', finalUserId)
      
      // Add product to database
      await addProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: 1, // For rental items, typically 1
        category: formData.category,
        images: imageUrls,
        seller_id: finalUserId,
        contact_number: formData.contactNumber,
        additional_details: formData.additionalDetails
      })
      
      toast.success('Product listed successfully!')
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        rentalPrice: '',
        contactNumber: '',
        additionalDetails: '',
        images: [],
        imagePreviews: []
      })
    } catch (error) {
      toast.error('Failed to list product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || (user.role !== 'seller' && user.role !== 'both')) {
    return null
  }

  return (
    <ProtectedRoute>
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
            <h1 className="text-2xl font-bold text-gray-900 ml-4">Sell Your Product</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardTitle className="text-2xl flex items-center">
              <Plus className="h-6 w-6 mr-2" />
              List Your Product for Rent
            </CardTitle>
            <p className="text-green-100 mt-2">
              Share your items with the community and earn money by renting them out
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Product Images <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {formData.imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {formData.images.length < 5 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-32 hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Upload Images</span>
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Upload up to 5 images. First image will be the main display image.
                </p>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className="w-full"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product in detail"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Category and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Price per day"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* Additional Pricing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Rental Options (Optional)
                </label>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    You can set different pricing for longer rental periods:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Weekly Rate (₹)</label>
                      <Input
                        type="number"
                        placeholder="Weekly price"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Monthly Rate (₹)</label>
                      <Input
                        type="number"
                        placeholder="Monthly price"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Security Deposit (₹)</label>
                      <Input
                        type="number"
                        placeholder="Security deposit"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="Your phone number"
                  className="w-full"
                  required
                />
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={formData.additionalDetails}
                  onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                  placeholder="Any additional information about the product, rental terms, condition, etc."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Rental Terms */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Rental Terms & Conditions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Product must be returned in the same condition</li>
                  <li>• Security deposit may be required</li>
                  <li>• Renter is responsible for any damages</li>
                  <li>• Minimum rental period may apply</li>
                  <li>• Pickup and return arrangements to be discussed</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black hover:bg-gray-800 text-white px-8"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Listing...
                    </div>
                  ) : (
                    'List Product'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </ProtectedRoute>
  )
}
