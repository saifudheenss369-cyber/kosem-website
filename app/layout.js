import './globals.css';
import React from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';

export const metadata = {
    metadataBase: new URL('https://kosemperfume.com'),
    title: {
        default: 'Kosem | Premium Attar & Oudh',
        template: '%s | Kosem Perfume'
    },
    description: 'Discover authentic, alcohol-free premium attar and oudh crafted from the rarest natural ingredients. Experience true luxury fragrances.',
    keywords: ['Attar', 'Oudh', 'Premium Fragrance', 'Alcohol-Free Perfume', 'Luxury Attar', 'Indian Attar', 'Kosem'],
    openGraph: {
        title: 'Kosem | Premium Attar & Oudh',
        description: 'Authentic, alcohol-free premium attar and oudh.',
        url: 'https://kosemperfume.com',
        siteName: 'Kosem Perfume',
        locale: 'en_IN',
        type: 'website',
    },
    icons: {
        icon: '/logo.png',
        apple: '/logo.png',
    },
    manifest: '/manifest.json',
    robots: {
        index: true,
        follow: true,
    }
};

import WhatsAppFloat from './components/WhatsAppFloat';
import FloatingCartButton from './components/FloatingCartButton';
import PWAController from './components/PWAController';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
                <meta name="theme-color" content="#D4AF37" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body>
                <WishlistProvider>
                    <CartProvider>
                        <AuthProvider>
                            <div className="main-wrapper">
                                {children}
                            </div>
                            <CartDrawer />
                            <Footer />
                            <WhatsAppFloat />
                            <FloatingCartButton />
                            <PWAController />
                        </AuthProvider>
                    </CartProvider>
                </WishlistProvider>
            </body>
        </html>
    );
}
