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
            <main className="container" style={{ paddingTop: '120px', paddingBottom: '8rem' }}>
                {/* Prepaid Filter/Banner */}
                <div style={{
                    background: '#e8f5e9',
                    border: '1px solid #c8e6c9',
                    color: '#2e7d32',
                    padding: '1rem',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    letterSpacing: '1px'
                }}>
                    <span style={{ fontSize: '1.4rem' }}>💎</span>
                    <span>FLAT 5% DISCOUNT ON PREPAID ORDERS</span>
                </div>

                <div className="shop-layout" style={{
                    display: 'grid',
                    gridTemplateColumns: '250px 1fr',
                    gap: '2rem',
                    alignItems: 'start'
                }}>
                    {/* SIDEBAR FILTERS */}
                    <aside className="shop-sidebar" style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        position: 'sticky',
                        top: '100px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-serif)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                Filters
                            </h2>
                            {(selectedCategories.length > 0 || selectedOccasions.length > 0) && (
                                <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: '#d4af37', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear All</button>
                            )}
                        </div>

                        {/* Occasion Filter */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#333', display: 'flex', justifyContent: 'space-between' }}>
                                Occasion
                            </h3>
                            <div className="filter-group">
                                {occasionOptions.map(occ => (
                                    <label key={occ} className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', color: '#555' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedOccasions.includes(occ)}
                                            onChange={() => toggleOccasion(occ)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#111' }}
                                        />
                                        {occ}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '1.5rem 0' }} />

                        {/* Category Filter */}
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#333', display: 'flex', justifyContent: 'space-between' }}>
                                Category/Type
                            </h3>
                            <div className="filter-group">
                                {categories.map(cat => (
                                    <label key={cat.id} className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', color: '#555' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.name)}
                                            onChange={() => toggleCategory(cat.name)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#111' }}
                                        />
                                        {cat.name}
                                    </label>
                                ))}
                                {categories.length === 0 && <p style={{ color: '#888', fontSize: '0.85rem' }}>Loading categories...</p>}
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <div className="shop-main">
                        {/* Top Controls (Sort & Search) */}
                        <div className="shop-top-controls" style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem',
                            gap: '1rem'
                        }}>
                            <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', margin: 0 }}>
                                Collection <span style={{ fontSize: '1rem', color: '#888', fontFamily: 'var(--font-sans)', fontWeight: 'normal' }}>({products.length} Items)</span>
                            </h1>

                            <div className="search-sort-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <form className="search-form" onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', width: '200px' }}
                                    />
                                </form>

                                <div className="sort-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                        style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'transparent', outline: 'none', cursor: 'pointer', fontWeight: '500' }}
                                    >
                                        <option value="price_asc">Price - Low to High</option>
                                        <option value="price_desc">Price - High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="product-layout" style={{ gap: '2rem' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                    <div key={n} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                                        <div className="shimmer-box" style={{ height: '300px', width: '100%' }}></div>
                                        <div style={{ padding: '1rem' }}>
                                            <div className="shimmer-box" style={{ height: '20px', width: '60%', marginBottom: '10px' }}></div>
                                            <div className="shimmer-box" style={{ height: '15px', width: '80%', marginBottom: '10px' }}></div>
                                            <div className="shimmer-box" style={{ height: '20px', width: '40%', marginBottom: '15px' }}></div>
                                            <div className="shimmer-box" style={{ height: '40px', width: '100%', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                ))}
                                <style>{`
                                    .shimmer-box {
                                        background: #f6f7f8;
                                        background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                                        background-repeat: no-repeat;
                                        background-size: 800px 100%; 
                                        animation-duration: 1.5s;
                                        animation-fill-mode: forwards; 
                                        animation-iteration-count: infinite;
                                        animation-name: placeholderShimmer;
                                        animation-timing-function: linear;
                                    }
                                    @keyframes placeholderShimmer {
                                        0% { background-position: -468px 0; }
                                        100% { background-position: 468px 0; }
                                    }
                                `}</style>
                            </div>
                        ) : (
                            <div className="product-layout" style={{ gap: '2rem' }}>
                                {products.length === 0 ? (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: '#f9f9f9', borderRadius: '8px' }}>
                                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>No products found</h3>
                                        <p style={{ color: '#666' }}>Try adjusting your filters or search term to find what you're looking for.</p>
                                        <button onClick={clearAllFilters} className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.8rem 2rem' }}>Clear All Filters</button>
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
            </main >

            <style>{`
                /* Base Filter Styles */
                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }

                /* Responsive layout for shop */
                @media (max-width: 900px) {
                    .shop-layout {
                        display: flex !important;
                        flex-direction: column !important;
                    }
                    .shop-sidebar {
                        position: static !important;
                        margin-bottom: 2rem;
                        padding: 1.5rem !important;
                    }
                    /* Transform filters into horizontal scrollable chips or wrapped flex on mobile */
                    .filter-group {
                        flex-direction: row !important;
                        flex-wrap: wrap !important;
                        gap: 0.8rem !important;
                    }
                    .filter-label {
                        background: #f8f9fa;
                        padding: 0.6rem 1rem !important;
                        border-radius: 25px;
                        border: 1px solid #eee;
                        white-space: nowrap;
                    }
                    .filter-label:has(input:checked) {
                        background: #fdf5e6;
                        border-color: var(--color-gold);
                    }
                    /* Top Controls Responsive */
                    .shop-top-controls {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 1.5rem !important;
                    }
                    .search-sort-container {
                        width: 100%;
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 1rem !important;
                    }
                    .search-form input {
                        width: 100% !important;
                    }
                    .sort-container {
                        justify-content: space-between;
                        width: 100%;
                        background: #f9f9f9;
                        padding: 0.5rem 1rem;
                        border-radius: 4px;
                        border: 1px solid #eee;
                    }
                }
            `}</style>
        </>
    );
}
