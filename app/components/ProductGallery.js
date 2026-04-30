'use client';

import { useState } from 'react';

export default function ProductGallery({ images, productName }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div style={{ background: 'var(--color-bg-secondary)', height: '550px', display: 'grid', placeItems: 'center', color: 'var(--color-text-muted)' }}>
                No Image
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Main Image */}
            <div style={{ background: 'var(--color-bg-secondary)', height: '550px', borderRadius: '0', overflow: 'hidden', position: 'relative' }}>
                <img 
                    src={images[currentIndex]} 
                    alt={`${productName} image ${currentIndex + 1}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {images.map((img, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setCurrentIndex(idx)}
                            style={{ 
                                width: '80px', 
                                height: '80px', 
                                flexShrink: 0, 
                                cursor: 'pointer',
                                border: currentIndex === idx ? '2px solid var(--color-gold)' : '1px solid transparent',
                                opacity: currentIndex === idx ? 1 : 0.6,
                                transition: 'all 0.2s ease',
                                overflow: 'hidden'
                            }}
                        >
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
