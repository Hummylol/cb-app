'use server'

import { GoogleGenAI } from '@google/genai'
import { supabase } from './supabase'

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ''
})

export async function chatWithAI(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return { error: 'Gemini API Key is not configured. Please add GEMINI_API_KEY to your .env.local file.' }
        }

        // 1. Fetch products for context
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('name, description, price, category')

        if (productsError) {
            console.error('Error fetching products for context:', productsError)
        }

        const productContext = products && products.length > 0
            ? `AVAILABLE PRODUCTS IN MARKETPLACE:\n${products.map(p => {
                return `- Name: ${p.name}\n  Description: ${p.description}\n  Price: ₹${p.price}\n  Category: ${p.category}\n---\n`
            }).join('')}`
            : "Currently, there are no products listed in the marketplace."

        // 2. Prepare system prompt
        const systemInstruction = `You are "ShopBot", the AI assistant for "ShopNow", a premium peer-to-peer rental marketplace. 
Your goal is to help users find the perfect items to rent.

MARKETPLACE CONTEXT:
ShopNow allows users to rent high-quality items like electronics, home decor, books, and sports gear from others in their community. It's affordable, sustainable, and convenient.

${productContext}

RESPONSE GUIDELINES:
- Be helpful, enthusiastic, and professional.
- When thinking of suggestions, look through the AVAILABLE PRODUCTS list above.
- Mention specific product names and prices when recommending items.
- If a user asks for something not in the list, acknowledge it and suggest the closest alternative from our catalog.
- IMPORTANT: Use markdown for formatting: Use **bold** for product names, *italic* for emphasis, and bullet points for lists.
- Keep responses concise and focused on helping the user make a rental decision.`

        // Convert history to GenAI contents format
        // Ensure history starts with 'user' role
        let cleanHistory = history.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: h.parts
        }));

        while (cleanHistory.length > 0 && cleanHistory[0].role !== 'user') {
            cleanHistory = cleanHistory.slice(1);
        }

        // 3. Call Generate Content - Prepend system prompt to the user message for maximum compatibility
        const finalMessage = `SYSTEM INSTRUCTION: ${systemInstruction}\n\nUSER MESSAGE: ${message}`

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                ...cleanHistory,
                { role: 'user', parts: [{ text: finalMessage }] }
            ]
        })

        return { text: response.text }
    } catch (error: unknown) {
        console.error('GenAI API Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while communicating with the AI.'
        return { error: errorMessage }
    }
}
