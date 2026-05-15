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

    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    const toggleCategory = (catName) => {
        // Switch to single selection for a cleaner 'Shop by Category' feel
        setSelectedCategories(prev =>
            prev.includes(catName) ? [] : [catName]
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
                                <button 
                                    className="show-mobile"
                                    onClick={() => setIsFilterDrawerOpen(true)}
                                    style={{
                                        padding: '0.8rem 1.2rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(184, 134, 11, 0.5)',
                                        borderRadius: '12px',
                                        color: 'var(--color-gold)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        display: 'none'
                                    }}
                                >
                                    Filters
                                </button>

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

                        {/* Category Filter: Dropdown on Mobile, Chips on Desktop */}
                        <div className="category-filter-wrap" style={{ padding: '0.5rem 0' }}>
                            {/* Mobile Dropdown */}
                            <div className="show-mobile" style={{ display: 'none' }}>
                                <select
                                    value={selectedCategories[0] || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedCategories(val ? [val] : []);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 1.2rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(184, 134, 11, 0.4)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23B8860B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 1.2rem top 50%',
                                        backgroundSize: '0.65rem auto'
                                    }}
                                >
                                    <option value="" style={{ background: 'var(--color-bg-secondary)' }}>All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name} style={{ background: 'var(--color-bg-secondary)' }}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Desktop Horizontal Scroll */}
                            <div className="category-scroll-container hide-mobile" style={{ 
                                overflowX: 'auto', 
                                whiteSpace: 'nowrap', 
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
                                Clear All
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

                {/* Mobile Filter Drawer */}
                {isFilterDrawerOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'flex-end'
                    }} onClick={() => setIsFilterDrawerOpen(false)}>
                        <div style={{
                            background: 'var(--color-bg-secondary)',
                            width: '100%',
                            maxHeight: '80vh',
                            borderTopLeftRadius: '30px',
                            borderTopRightRadius: '30px',
                            padding: '2.5rem 1.5rem',
                            overflowY: 'auto'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>Filters</h2>
                                <button onClick={() => setIsFilterDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' }}>✕</button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Occasion</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {occasionOptions.map(occ => (
                                        <button 
                                            key={occ}
                                            onClick={() => toggleOccasion(occ)}
                                            style={{
                                                padding: '0.6rem 1.2rem',
                                                borderRadius: '10px',
                                                border: '1px solid ' + (selectedOccasions.includes(occ) ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)'),
                                                background: selectedOccasions.includes(occ) ? 'rgba(184, 134, 11, 0.1)' : 'transparent',
                                                color: selectedOccasions.includes(occ) ? 'var(--color-gold)' : 'white',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {occ}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => { clearAllFilters(); setIsFilterDrawerOpen(false); }}
                                style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-gold)', borderRadius: '15px', fontWeight: '700', marginBottom: '1rem' }}
                            >
                                Clear All
                            </button>
                            <button 
                                onClick={() => setIsFilterDrawerOpen(false)}
                                style={{ width: '100%', padding: '1rem', background: 'var(--color-gold)', border: 'none', color: 'black', borderRadius: '15px', fontWeight: '700' }}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{ __html: `
                    .category-scroll-container::-webkit-scrollbar { display: none; }
                    
                    @media (max-width: 900px) {
                        .shop-layout {
                            grid-template-columns: 1fr !important;
                        }
                        .hide-mobile {
                            display: none !important;
                        }
                        .show-mobile {
                            display: block !important;
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
