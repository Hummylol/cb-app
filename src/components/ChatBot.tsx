'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { MessageSquare, X, Send, Bot, User } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { chatWithAI } from '@/lib/actions'
import { useChatStore } from '@/lib/store'

interface Message {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

export default function ChatBot() {
    const { isOpen, setOpen, initialMessage } = useChatStore()
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hi! I\'m your assistant. How can I help you find the perfect rental today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const scrollRef = useRef<HTMLDivElement>(null)

    const handleSend = useCallback(async (textOverride?: string) => {
        const messageText = typeof textOverride === 'string' ? textOverride : input
        if (!messageText.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        if (typeof textOverride !== 'string') setInput('')
        setIsLoading(true)

        try {
            // Prepare history for Gemini
            // We use the latest messages from state. Note: this might have closure issues if not careful, 
            // but for a simple chat it's usually okay or we can use the ref/updater pattern.
            // Using a functional update for messages but we need the current messages for history.

            const history = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model' as 'user' | 'model',
                parts: [{ text: msg.text }]
            }))

            const response = await chatWithAI(messageText, history)

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.text || response.error || "I'm sorry, I couldn't process that.",
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMessage])
        } catch (error) {
            console.error('Chat error:', error)
        } finally {
            setIsLoading(false)
        }
    }, [input, isLoading, messages])

    useEffect(() => {
        if (initialMessage) {
            handleSend(initialMessage)
            useChatStore.setState({ initialMessage: '' }) // Clear it
        }
    }, [initialMessage, handleSend])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setOpen(true)}
                className={`fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center z-50 group ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <MessageSquare className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </button>

            {/* Chat Drawer Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Chat Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-[70] transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg tracking-tight">AI Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-xs font-bold text-gray-400">Online</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(false)}
                        className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fafafa] no-scrollbar"
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className={`p-4 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                                        <div className="text-sm font-medium leading-relaxed prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:pl-4 prose-blockquote:italic">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <p className="mb-0">{children}</p>,
                                                    strong: ({ children }) => <strong className="font-bold text-inherit">{children}</strong>,
                                                    ul: ({ children }) => <ul className="list-disc ml-4 mt-2 space-y-1">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal ml-4 mt-2 space-y-1">{children}</ol>,
                                                    li: ({ children }) => <li className="text-sm">{children}</li>
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold text-gray-400 mt-1 block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="p-4 bg-white border border-gray-100 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggested Prompts */}
                <div className="px-6 py-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['Recommend decor', 'Find electronics', 'How it works?'].map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => handleSend(prompt)}
                                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200 transition-colors whitespace-nowrap"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="p-6 bg-white border-t border-gray-100">
                    <div className="relative flex items-center gap-3">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                            className="h-14 pl-5 pr-14 bg-gray-50 border-none rounded-2xl font-medium focus-visible:ring-2 focus-visible:ring-blue-600/20"
                        />
                        <Button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-1.5 h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
