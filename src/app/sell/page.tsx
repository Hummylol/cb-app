'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, X, Plus, MapPin, QrCode, Phone, Tag, AlignLeft, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
  address: string
  additionalDetails: string
  images: File[]
  imagePreviews: string[]
  upiQr: File | null
  upiQrPreview: string | null
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
    address: '',
    additionalDetails: '',
    images: [],
    imagePreviews: [],
    upiQr: null,
    upiQrPreview: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addProduct } = useProductsStore()

  useEffect(() => {
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
    const newImages = [...formData.images, ...files].slice(0, 5)
    const newPreviews = newImages.map(file => URL.createObjectURL(file))

    setFormData(prev => ({
      ...prev,
      images: newImages,
      imagePreviews: newPreviews
    }))
  }

  const handleUpiQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        upiQr: file,
        upiQrPreview: URL.createObjectURL(file)
      }))
    }
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

  const removeUpiQr = () => {
    setFormData(prev => ({
      ...prev,
      upiQr: null,
      upiQrPreview: null
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.contactNumber || !formData.address) {
        toast.error('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      if (formData.images.length === 0) {
        toast.error('Please upload at least one product image')
        setIsSubmitting(false)
        return
      }

      const userId = user?.id
      if (!userId) {
        toast.error('You must be logged in to list products')
        setIsSubmitting(false)
        return
      }

      const uploadFile = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/${path}_${Date.now()}.${fileExt}`

        const { error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file)

        if (error) {
          // Fallback to base64 if storage is not set up
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        return publicUrl
      }

      const imageUrls: string[] = []
      for (const file of formData.images) {
        imageUrls.push(await uploadFile(file, 'product') as string)
      }

      let upiQrUrl: string | undefined = undefined
      if (formData.upiQr) {
        upiQrUrl = await uploadFile(formData.upiQr, 'upi_qr') as string
      }

      await addProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: 1,
        category: formData.category,
        images: imageUrls,
        seller_id: userId,
        contact_number: formData.contactNumber,
        address: formData.address,
        upi_qr: upiQrUrl,
        additional_details: formData.additionalDetails
      })

      toast.success('Product listed successfully!')
      router.push('/')
    } catch (error) {
      console.error(error)
      toast.error('Failed to list product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F8FAFC]">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                  </Button>
                </Link>
                <div className="ml-4">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Create Listing
                  </h1>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex text-slate-500 border-slate-200 rounded-full"
                onClick={() => router.push('/')}
              >
                Cancel
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-32 sm:pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Visual Media Section */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Visual Media</h2>
              </div>

              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 bg-slate-50">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-600/90 py-1 text-[10px] text-center text-white font-medium">
                            MAIN IMAGE
                          </div>
                        )}
                      </div>
                    ))}

                    {formData.images.length < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center p-4">
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                        <Plus className="h-6 w-6 text-slate-400 mb-1" />
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Add Photo</span>
                        <span className="text-[9px] text-slate-400 mt-1">{formData.images.length}/5 photos</span>
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Core Details */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Tag className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">What are you listing?</h2>
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Product Title <span className="text-red-500">*</span></label>
                    <Input
                      placeholder="e.g. Vintage DSLR Camera or Study Desk"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="border-slate-200 focus-visible:ring-blue-500 h-11"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></label>
                      <select
                        className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Daily Rental Price (₹) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-7 border-slate-200 focus-visible:ring-blue-500 h-11"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description <span className="text-red-500">*</span></label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What makes your item special? Mention condition, age, or special requirements..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Location & Payment */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Location & Payments</h2>
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Pickup Address <span className="text-red-500">*</span></label>
                      <div className="flex items-center text-[10px] text-slate-400 uppercase tracking-widest">
                        <Info className="h-3 w-3 mr-1" />
                        Visible to buyers
                      </div>
                    </div>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Flat 402, Sunshine Apts, Near Hitech City Metro, Hyderabad"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                    <p className="text-[10px] text-slate-400 italic">This address will be used to generate a Google Maps link for the buyer.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Contact Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="tel"
                          placeholder="+91 00000 00000"
                          className="pl-10 border-slate-200 focus-visible:ring-blue-500 h-11"
                          value={formData.contactNumber}
                          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">UPI QR Code (Optional)</label>
                      {formData.upiQrPreview ? (
                        <div className="relative w-full aspect-video rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                          <img src={formData.upiQrPreview} alt="UPI QR" className="h-full object-contain" />
                          <button
                            type="button"
                            onClick={removeUpiQr}
                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all">
                          <input type="file" accept="image/*" onChange={handleUpiQrUpload} className="hidden" />
                          <div className="text-center">
                            <QrCode className="h-6 w-6 text-slate-400 mx-auto" />
                            <span className="text-[11px] text-slate-500">Upload UPI QR</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Bottom Actions for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 sm:static sm:p-0 sm:bg-transparent sm:border-0 z-40">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto sm:px-12 h-14 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-lg font-bold shadow-lg shadow-blue-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Publish Listing'}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  )
}
