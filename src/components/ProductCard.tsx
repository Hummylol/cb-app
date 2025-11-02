'use client'

import { Heart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square relative overflow-hidden cursor-pointer">
          <Image
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 bg-white/80 hover:bg-white ${
                isWishlisted ? 'text-red-500' : 'text-gray-500'
              }`}
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-700">
              {product.category}
            </Badge>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500">(4.8)</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600">
              ₹{product.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              {product.stock_quantity} in stock
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 border-2 rounded-xl bg-black text-white">
        <Button
          onClick={() => {
            onAddToCart(product)
            toast.success('Added to cart')
          }}
          disabled={product.stock_quantity === 0}
          className="w-full group-hover:bg-blue-600 transition-colors"
        >
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}
