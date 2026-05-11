'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState([]);

    // Load wishlist from local storage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('attar_wishlist');
        if (savedWishlist) {
            setWishlist(JSON.parse(savedWishlist));
        }
    }, []);

    // Save wishlist to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('attar_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product) => {
        setWishlist((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) return prev; // already in wishlist
            return [...prev, product];
        });
    };

    const removeFromWishlist = (id) => {
        setWishlist((prev) => prev.filter((item) => item.id !== id));
    };

    const toggleWishlist = (product) => {
        const existing = wishlist.find((item) => item.id === product.id);
        if (existing) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const isInWishlist = (id) => {
        return wishlist.some(item => item.id === id);
    };

    const clearWishlist = () => setWishlist([]);

    const wishlistCount = wishlist.length;

    return (
        <WishlistContext.Provider value={{
            wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, clearWishlist, wishlistCount
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
