'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, CreditCard, Sparkles, ShieldCheck, Truck, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
        await new Promise(resolve => setTimeout(resolve, 2000))
        clearCart()
        setIsCheckingOut(false)
        toast.success('Order placed successfully!')
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#fafafa]">
                <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center h-20">
                            <Link href="/">
                                <Button variant="ghost" className="rounded-2xl hover:bg-gray-100 group transition-all">
                                    <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                                    <span className="font-semibold text-gray-700">Back to Shop</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 pt-24 text-center">
                    <div className="relative mb-10 group">
                        <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 scale-150"></div>
                        <div className="relative w-40 h-40 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <ShoppingBag className="h-20 w-20 text-gray-200" />
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-blue-600 rounded-2xl shadow-lg flex items-center justify-center text-white">
                                <Plus className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Your cart is empty.</h2>
                    <p className="text-xl text-gray-500 mb-10 max-w-md font-medium leading-relaxed">
                        Looks like you haven&apos;t added any premium gear to your collection yet.
                    </p>

                    <Link href="/">
                        <Button size="lg" className="h-16 px-12 text-lg font-black rounded-2xl bg-gray-900 hover:bg-blue-600 text-white shadow-2xl shadow-gray-200 transition-all active:scale-95 flex items-center gap-3">
                            <Sparkles className="h-5 w-5" />
                            Start Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20">
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link href="/">
                            <Button variant="ghost" className="rounded-2xl hover:bg-gray-100 group transition-all">
                                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-semibold text-gray-700 hidden sm:inline">Continue Shopping</span>
                                <span className="sm:hidden font-semibold">Back</span>
                            </Button>
                        </Link>

                        <div className="flex items-center space-x-6">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Shopping Bag</h1>
                            <Badge className="bg-gray-900 text-white rounded-xl px-3 py-1 font-black shadow-lg">
                                {items.length}
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest text-[10px]">Your Selection</h3>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    clearCart()
                                    toast.success('Cart cleared')
                                }}
                                className="text-gray-400 hover:text-red-600 font-bold text-sm tracking-tight rounded-xl hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item) => (
                                <Card key={item.id} className="group border-none bg-white shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:translate-y-[-2px]">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            {/* Product Image */}
                                            <div className="relative w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 rounded-[1.5rem] overflow-hidden bg-gray-50 border border-gray-100">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            {(item as any).category && (
                                                                <Badge className="bg-blue-50 text-blue-600 border-none rounded-lg text-xs font-bold mb-2">
                                                                    {(item as any).category}
                                                                </Badge>
                                                            )}
                                                            <Link href={`/product/${item.product_id}`}>
                                                                <h3 className="text-xl font-black text-gray-900 hover:text-blue-600 transition-colors leading-tight">
                                                                    {item.title}
                                                                </h3>
                                                            </Link>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                removeItem(item.product_id)
                                                                toast.success('Removed from bag')
                                                            }}
                                                            className="h-10 w-10 p-0 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-6">
                                                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                            className="h-8 w-8 p-0 hover:bg-white rounded-lg transition-all"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <span className="w-10 text-center font-black text-gray-900">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                            className="h-8 w-8 p-0 hover:bg-white rounded-lg transition-all"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block">Subtotal</span>
                                                        <p className="text-2xl font-black text-blue-600">
                                                            ₹{(item.price * item.quantity).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                        <Card className="border-none bg-gray-900 text-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
                            <div className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tighter">Order Summary</h2>
                                    <p className="text-gray-400 font-medium">Global secure shipping included</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-gray-400">
                                        <span className="font-bold">Subtotal ({items.reduce((total, item) => total + item.quantity, 0)} items)</span>
                                        <span className="text-white font-black text-lg">₹{getTotalPrice().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-400">
                                        <span className="font-bold">Shipping Premium</span>
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black px-3">FREE</Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-400">
                                        <span className="font-bold">Service Fee</span>
                                        <span className="text-white font-black text-lg">₹0</span>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-6">
                                    <div className="flex justify-between items-end mb-8">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                                        <span className="text-5xl font-black text-white tracking-tighter">
                                            ₹{getTotalPrice().toLocaleString()}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={handleCheckout}
                                        disabled={isCheckingOut}
                                        className="w-full h-20 text-xl font-black rounded-3xl bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-500/40 transition-all active:scale-[0.98] group"
                                        size="lg"
                                    >
                                        {isCheckingOut ? (
                                            <div className="flex items-center scale-110">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                                Verifying...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center scale-110">
                                                <CreditCard className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                                                Place Order
                                            </div>
                                        )}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Secure</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                        <Truck className="h-5 w-5" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Fast</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                        <Sparkles className="h-5 w-5" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Best Price</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <p className="mt-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Secured by LuxuryPass Payments
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
