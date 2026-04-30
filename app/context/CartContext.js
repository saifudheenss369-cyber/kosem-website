'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('attar_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('attar_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQty = item.quantity + delta;
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            })
        );
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, clearCart,
            isCartOpen, setIsCartOpen, cartTotal, cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
