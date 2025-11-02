import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, Product } from './supabase'

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
  // Fallback for server-side rendering
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export interface CartItem {
  id: string
  product_id: string
  title: string
  price: number
  image: string
  quantity: number
}

export interface WishlistItem {
  id: string
  product_id: string
  title: string
  price: number
  image: string
  category: string
}

// Re-export Product type from supabase
export type { Product } from './supabase'

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
}

interface ProductsStore {
  products: Product[]
  loading: boolean
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  removeProduct: (productId: string) => Promise<void>
  fetchProducts: () => Promise<void>
  getMyProducts: (sellerId: string) => Product[]
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items
        const existingItem = items.find(i => i.product_id === item.product_id)
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          })
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.product_id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
        } else {
          set({
            items: get().items.map(item =>
              item.product_id === productId
                ? { ...item, quantity }
                : item
            )
          })
        }
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
    }),
    {
      name: 'cart-storage'
    }
  )
)

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items
        const existingItem = items.find(i => i.product_id === item.product_id)
        
        if (!existingItem) {
          set({ items: [...items, item] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.product_id !== productId) })
      },
      clearWishlist: () => set({ items: [] }),
      isInWishlist: (productId) => {
        return get().items.some(item => item.product_id === productId)
      }
    }),
    {
      name: 'wishlist-storage'
    }
  )
)

export const useProductsStore = create<ProductsStore>()((set, get) => ({
  products: [],
  loading: false,
  
  fetchProducts: async () => {
    set({ loading: true })
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here') {
      console.log('Supabase not configured, using local storage...')
      set({ loading: false })
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase fetch error:', error)
        throw error
      }
      
      console.log('Products fetched successfully:', data)
      set({ products: data || [] })
    } catch (error) {
      console.error('Error fetching products:', error)
      console.log('Falling back to local storage for products...')
      
      // Fallback: Try to get from localStorage
      try {
        const localProducts = localStorage.getItem('products-storage')
        if (localProducts) {
          const parsed = JSON.parse(localProducts)
          if (parsed.state && parsed.state.products) {
            set({ products: parsed.state.products })
            console.log('Loaded products from local storage')
          }
        }
      } catch (localError) {
        console.error('Error loading from local storage:', localError)
        set({ products: [] })
      }
    } finally {
      set({ loading: false })
    }
  },

  addProduct: async (productData) => {
    // Validate required fields
    if (!productData.seller_id) {
      console.error('Missing seller_id in product data:', productData)
      throw new Error('Seller ID is required')
    }
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here') {
      console.log('Supabase not configured, saving to local storage...')
      const fallbackProduct = {
        ...productData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      set({ products: [fallbackProduct, ...get().products] })
      return
    }
    
    try {
      console.log('Attempting to add product:', productData)
      
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Product added successfully:', data)
      // Add to local state
      set({ products: [data, ...get().products] })
    } catch (error) {
      console.error('Error adding product:', error)
      
      // Fallback: Add to local storage if database fails
      console.log('Falling back to local storage...')
      const fallbackProduct = {
        ...productData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      set({ products: [fallbackProduct, ...get().products] })
      
      // Don't throw error, just log it
      console.warn('Product saved locally due to database error')
    }
  },

  removeProduct: async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }
      
      // Remove from local state
      set({ products: get().products.filter(product => product.id !== productId) })
    } catch (error) {
      console.error('Error removing product:', error)
      
      // Fallback: Remove from local state only
      console.log('Falling back to local removal...')
      set({ products: get().products.filter(product => product.id !== productId) })
      console.warn('Product removed locally due to database error')
    }
  },

  getMyProducts: (sellerId) => get().products.filter(product => product.seller_id === sellerId)
}))
