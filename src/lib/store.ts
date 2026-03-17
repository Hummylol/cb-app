import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, Product } from './supabase'

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
            try {
                if (typeof window !== 'undefined') {
                    const localProducts = localStorage.getItem('products-storage')
                    if (localProducts) {
                        const parsed = JSON.parse(localProducts)
                        if (parsed.state && parsed.state.products) {
                            set({ products: parsed.state.products })
                        }
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
        set({ loading: true })
        if (!productData.seller_id) {
            set({ loading: false })
            throw new Error('Seller ID is required')
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here') {
            const fallbackProduct: Product = {
                ...productData,
                id: Math.random().toString(36).substring(2, 9),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            set({ products: [fallbackProduct, ...get().products], loading: false })
            return
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    stock_quantity: productData.stock_quantity,
                    category: productData.category,
                    images: productData.images,
                    seller_id: productData.seller_id,
                    contact_number: productData.contact_number,
                    address: productData.address,
                    upi_qr: productData.upi_qr,
                    additional_details: productData.additional_details
                }])
                .select()

            if (error) throw error
            if (data) {
                set((state) => ({ products: [data[0], ...state.products] }))
            }
        } catch (error) {
            console.error('Error adding product:', error)
            const fallbackProduct: Product = {
                ...productData,
                id: Math.random().toString(36).substring(2, 9),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            set({ products: [fallbackProduct, ...get().products] })
        } finally {
            set({ loading: false })
        }
    },

    removeProduct: async (productId) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)

            if (error) {
                console.error('Supabase error removing product:', error)
                throw error
            }

            set({ products: get().products.filter(p => p.id !== productId) })
        } catch (error) {
            console.error('Error in removeProduct:', error)
            // Still update local state if it's a specific "not found" or similar case?
            // Actually, if it failed in DB, we should probably NOT update local state
            // unless we want to "force" it. But the user says it's stuck.
            throw error
        }
    },

    getMyProducts: (sellerId) => get().products.filter(product => product.seller_id === sellerId)
}))

interface ChatStore {
    isOpen: boolean
    initialMessage: string
    setOpen: (open: boolean) => void
    sendMessage: (message: string) => void
}

export const useChatStore = create<ChatStore>()((set) => ({
    isOpen: false,
    initialMessage: '',
    setOpen: (open) => set({ isOpen: open }),
    sendMessage: (message) => set({ isOpen: true, initialMessage: message })
}))
