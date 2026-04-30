'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

export default function WhatsAppFloat() {
    const pathname = usePathname();
    const phoneNumber = '919074678278'; // ADMIN NUMBER
    const message = 'Hello Kosem, I am interested in your products.';

    if (pathname.startsWith('/admin')) return null;

    return (
        <a
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                position: 'fixed',
                bottom: '6rem',
                right: '2rem',
                background: '#25D366',
                color: 'white',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                zIndex: 1000,
                transition: 'all 0.3s ease',
                textDecoration: 'none',
                border: 'none',
                outline: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <FaWhatsapp size={35} />
        </a>
    );
}
