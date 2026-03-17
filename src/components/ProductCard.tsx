'use client'

import { Heart, Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWishlistStore, Product } from '@/lib/store'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore()
  const isWishlisted = isInWishlist(product.id)

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isWishlisted) {
      removeItem(product.id)
      toast.success('Removed from wishlist')
    } else {
      addItem({
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

  return (
    <Card className="group relative bg-white/40 backdrop-blur-sm border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-3xl shadow-lg">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-[4/5] relative overflow-hidden cursor-pointer">
          <Image
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          {/* Blur Overlay on Hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <Badge className="bg-white/80 backdrop-blur-md text-gray-800 border-none shadow-sm capitalize rounded-lg px-3 py-1 text-xs font-semibold">
              {product.category}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className={`h-10 w-10 p-0 rounded-full backdrop-blur-md transition-all duration-300 ${isWishlisted
                ? 'bg-red-500 text-white shadow-red-200'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500 shadow-sm'
                }`}
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Bottom Info Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </Link>

      <CardContent className="p-6 relative">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer decoration-2 decoration-blue-500/0 hover:decoration-blue-500/50">
              {product.name}
            </h3>
          </Link>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
          {product.description}
        </p>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-400">4.8</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Fixed Price</span>
            <p className="text-2xl font-black text-blue-600">
              ₹{product.price.toLocaleString()}
            </p>
          </div>

          <Button
            onClick={() => {
              onAddToCart(product)
              toast.success('Added to cart')
            }}
            disabled={product.stock_quantity === 0}
            className={`
              h-12 px-6 rounded-2xl font-extrabold transition-all duration-300
              ${product.stock_quantity === 0
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 active:scale-95'}
            `}
          >
            {product.stock_quantity === 0 ? 'Sold Out' : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Add</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
