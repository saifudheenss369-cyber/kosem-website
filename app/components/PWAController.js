'use client';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PWAController() {
    const { user } = useAuth();

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile for regular users
            // Only allow it if user is logged in AND is an admin
            if (!user || user.role !== 'admin') {
                e.preventDefault();
            }
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [user]);

    return null;
}
