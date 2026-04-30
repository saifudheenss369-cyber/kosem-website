'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (userData) => {
        // Optimistic update or refetch
        setUser(userData);
        router.push('/');
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            // Clear cart from localStorage so next user doesn't see previous user's items
            localStorage.removeItem('attar_cart');
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
