'use client';

import { useState } from 'react';

function parseImages(images, gallery) {
    const all = [];
    if (images) all.push(images);
    if (gallery) {
        try {
            const parsed = JSON.parse(gallery);
            if (Array.isArray(parsed)) all.push(...parsed);
        } catch {}
    }
    return all;
}

export default function VariantGallery({ variants, currentProductId, productImages, productGallery }) {
    // Build a map of variantId → images array
    const variantImageMap = {};
    variants.forEach(v => {
        variantImageMap[v.id] = parseImages(v.images, v.gallery);
    });

    // Also include the current product's own images (passed directly from server)
    const currentImages = parseImages(productImages, productGallery);
    if (!variantImageMap[currentProductId]) {
        variantImageMap[currentProductId] = currentImages;
    }

    const [activeVariantId, setActiveVariantId] = useState(currentProductId);
    const [galleryIndex, setGalleryIndex] = useState(0);

    const images = variantImageMap[activeVariantId] || currentImages;

    const handleVariantClick = (variantId) => {
        if (variantId === activeVariantId) return;
        setActiveVariantId(variantId);
        setGalleryIndex(0); // reset to first image of new variant
    };

    return (
        <div>
            {/* Gallery */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                {/* Main Image */}
                <div style={{ background: '#f0f0f0', borderRadius: '0', overflow: 'hidden', position: 'relative' }} className="gallery-main-img">
                    {images.length > 0 ? (
                        <img
                            key={`${activeVariantId}-${galleryIndex}`}
                            src={images[galleryIndex]}
                            alt="Product"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }}
                        />
                    ) : (
                        <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#ccc' }}>
                            No Image
                        </div>
                    )}
                </div>

                <style>{`
                    .gallery-main-img {
                        height: 550px;
                    }
                    @media (max-width: 768px) {
                        .gallery-main-img {
                            height: 350px;
                        }
                    }
                `}</style>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => setGalleryIndex(idx)}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    border: galleryIndex === idx ? '2px solid var(--color-gold)' : '1px solid transparent',
                                    opacity: galleryIndex === idx ? 1 : 0.6,
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

        </div>
    );
}
