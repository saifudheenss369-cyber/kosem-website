'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Link from 'next/link';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');

    // Filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedOccasions, setSelectedOccasions] = useState([]);
    const [sortBy, setSortBy] = useState('price_asc'); // Default Ajmal-style
    const [loading, setLoading] = useState(true);

    const occasionOptions = [
        "12 Hours", "Daily Wear", "Date Night", "Home Fragrance",
        "Luxury Gifting", "Office", "Summer", "Wedding", "Winter"
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategories, selectedOccasions, sortBy]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) setCategories(await res.json());
        } catch (e) {
            console.error("Failed to fetch categories", e);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        let url = `/api/products?a=1&groupVariants=true`;
        if (selectedCategories.length > 0) url += `&category=${selectedCategories.join(',')}`;
        if (selectedOccasions.length > 0) url += `&occasions=${selectedOccasions.join(',')}`;
        if (search) url += `&q=${search}`;
        if (sortBy) url += `&sort=${sortBy}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                console.error("API returned non-array:", data);
                setProducts([]);
            }
        } catch (e) {
            console.error("Fetch error:", e);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const toggleCategory = (catName) => {
        setSelectedCategories(prev =>
            prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
        );
    };

    const toggleOccasion = (occName) => {
        setSelectedOccasions(prev =>
            prev.includes(occName) ? prev.filter(o => o !== occName) : [...prev, occName]
        );
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedOccasions([]);
        setSearch('');
        // fetchProducts will run due to useEffect
    };

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '90px', paddingBottom: '6rem', minHeight: '100vh', background: 'var(--color-bg-main)' }}>
                {/* 1. Header Section */}
                <div className="container" style={{ marginBottom: '2rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.1), transparent)',
                        padding: '2rem',
                        borderRadius: '20px',
                        border: '1px solid rgba(184, 134, 11, 0.2)',
                        textAlign: 'center',
                        marginBottom: '3rem'
                    }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
                            Our <span className="text-gradient-gold">Collection</span>
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
                            Discover the essence of luxury through our curated selection of fine attars and perfumes.
                        </p>
                    </div>

                    {/* 2. Top Bar: Search & Sort (Desktop) / Category Scroll (Mobile) */}
                    <div className="shop-controls" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1.5rem',
                        marginBottom: '3rem'
                    }}>
                        {/* Search & Sort Container */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div className="search-wrap" style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyUp={e => e.key === 'Enter' && fetchProducts()}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.8rem 1.2rem', 
                                        paddingLeft: '3rem',
                                        background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid rgba(184, 134, 11, 0.3)', 
                                        borderRadius: '12px',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    style={{ 
                                        padding: '0.8rem 1.2rem', 
                                        background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid rgba(184, 134, 11, 0.3)', 
                                        borderRadius: '12px',
                                        color: 'white',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Category Horizontal Scroll (Mobile & Desktop) */}
                        <div className="category-scroll-container" style={{ 
                            overflowX: 'auto', 
                            whiteSpace: 'nowrap', 
                            padding: '0.5rem 0',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none'
                        }}>
                            <div style={{ display: 'inline-flex', gap: '10px' }}>
                                <button 
                                    onClick={() => setSelectedCategories([])}
                                    style={{
                                        padding: '0.6rem 1.5rem',
                                        borderRadius: '30px',
                                        border: '1px solid ' + (selectedCategories.length === 0 ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)'),
                                        background: selectedCategories.length === 0 ? 'var(--color-gold)' : 'transparent',
                                        color: selectedCategories.length === 0 ? 'black' : 'white',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    All Products
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => toggleCategory(cat.name)}
                                        style={{
                                            padding: '0.6rem 1.5rem',
                                            borderRadius: '30px',
                                            border: '1px solid ' + (selectedCategories.includes(cat.name) ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)'),
                                            background: selectedCategories.includes(cat.name) ? 'var(--color-gold)' : 'transparent',
                                            color: selectedCategories.includes(cat.name) ? 'black' : 'white',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="shop-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
                        {/* SIDEBAR FILTERS (Desktop) */}
                        <aside className="shop-sidebar hide-mobile" style={{
                            background: 'rgba(255,255,255,0.02)',
                            padding: '2rem',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            position: 'sticky',
                            top: '120px',
                            height: 'fit-content'
                        }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-gold)' }}>Filter By</h2>
                            
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-text-muted)', marginBottom: '1.2rem' }}>Occasion</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {occasionOptions.map(occ => (
                                        <label key={occ} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.95rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedOccasions.includes(occ)}
                                                onChange={() => toggleOccasion(occ)}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
                                            />
                                            {occ}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button onClick={clearAllFilters} style={{ 
                                width: '100%', 
                                padding: '0.8rem', 
                                background: 'transparent', 
                                border: '1px solid rgba(184, 134, 11, 0.3)', 
                                color: 'var(--color-gold)', 
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}>
                                Clear All Filters
                            </button>
                        </aside>

                        {/* PRODUCT GRID */}
                        <div className="shop-main">
                            {loading ? (
                                <div className="product-grid-compact" style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                                    gap: '1.5rem' 
                                }}>
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                        <div key={n} style={{ height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', animation: 'pulse 1.5s infinite' }}></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="product-grid-compact" style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                                    gap: '1.5rem' 
                                }}>
                                    {products.length === 0 ? (
                                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 2rem' }}>
                                            <span style={{ fontSize: '4rem' }}>🕯️</span>
                                            <h2 style={{ marginTop: '1.5rem' }}>No products found</h2>
                                            <p style={{ color: 'var(--color-text-muted)' }}>Try adjusting your filters or search terms.</p>
                                        </div>
                                    ) : (
                                        products.map((product, index) => (
                                            <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                                                <ProductCard product={product} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .category-scroll-container::-webkit-scrollbar { display: none; }
                    
                    @media (max-width: 900px) {
                        .shop-layout {
                            grid-template-columns: 1fr !important;
                        }
                        .hide-mobile {
                            display: none !important;
                        }
                        .product-grid-compact {
                            grid-template-columns: 1fr 1fr !important;
                            gap: 12px !important;
                        }
                        .shop-controls {
                            margin-bottom: 2rem !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .product-grid-compact {
                            gap: 10px !important;
                        }
                    }

                    @keyframes pulse {
                        0% { opacity: 0.3; }
                        50% { opacity: 0.6; }
                        100% { opacity: 0.3; }
                    }
                `}} />
            </main>
        </>
    );
}
