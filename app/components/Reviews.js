'use client';

import { useState, useEffect } from 'react';
import CustomPopup from './CustomPopup';

export default function Reviews({ productId, product }) {
    const [reviews, setReviews] = useState([]);
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [newReview, setNewReview] = useState({ rating: 5, text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState('');

    useEffect(() => {
        // Fetch reviews
        fetch(`/api/reviews?productId=${productId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setReviews(data);
                } else {
                    const count = product?.fakeRatingCount || 0;
                    if (count > 0) {
                        const fakeReviews = [
                            { id: 'f1', user: { name: 'Verified Customer' }, rating: 5, text: 'Absolutely love this fragrance! Long lasting and premium quality.', createdAt: Date.now() - 100000000 },
                            { id: 'f2', user: { name: 'Attar Lover' }, rating: product.rating || 5, text: 'Best purchase I made recently. Highly recommended.', createdAt: Date.now() - 200000000 },
                            { id: 'f3', user: { name: 'Sadiq' }, rating: 5, text: 'Mashallah, very good smell.', createdAt: Date.now() - 300000000 },
                        ];
                        setReviews(fakeReviews);
                    } else {
                        setReviews([]);
                    }
                }
            })
            .catch(err => console.error("Failed to fetch reviews", err));

        // Fetch user eligibility
        fetch(`/api/reviews?productId=${productId}&checkEligibility=true`)
            .then(res => res.json())
            .then(data => {
                setCanReview(data.canReview);
                if (!data.canReview) {
                    if (data.reason === 'unauthorized') setReviewMessage('Please log in to share your experience.');
                    else if (data.reason === 'already_reviewed') setReviewMessage('Thank you for already reviewing this product!');
                    else if (data.reason === 'not_purchased') setReviewMessage('Only verified purchasers can leave a review for this product.');
                }
            })
            .catch(err => console.error("Failed to check review eligibility", err));
    }, [productId, product]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newReview, productId }),
            });

            if (res.ok) {
                const review = await res.json();
                setReviews(prev => [review, ...prev]);
                setNewReview({ rating: 5, text: '' });
                setCanReview(false);
                setReviewMessage('Thank you for already reviewing this product!');
                setPopupConfig({ isOpen: true, title: 'Success', message: 'Thank you! Your verified review has been published.', type: 'success' });
            } else {
                const errorData = await res.json();
                setPopupConfig({ isOpen: true, title: 'Error', message: errorData.error || 'Failed to submit review. Please try again.', type: 'error' });
            }
        } catch (e) {
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Error submitting review. Please check your connection.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const displayCount = reviews.length + (product?.fakeRatingCount || 0);

    return (
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
            <CustomPopup
                isOpen={popupConfig.isOpen}
                onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                title={popupConfig.title}
                message={popupConfig.message}
                type={popupConfig.type}
            />
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>
                Customer Reviews ({displayCount > reviews.length ? displayCount : reviews.length})
            </h3>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--color-gold)' }}>
                <h4 style={{ marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Write a Review</h4>
                {canReview ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Rating:</label>
                            <div style={{ display: 'inline-flex', gap: '5px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        style={{
                                            cursor: 'pointer',
                                            fontSize: '1.5rem',
                                            color: star <= newReview.rating ? '#FFD700' : '#ddd',
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        <textarea
                            placeholder="Share your experience..."
                            value={newReview.text}
                            onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                            required
                            style={{ width: '100%', padding: '1rem', minHeight: '100px', marginBottom: '1rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontFamily: 'inherit' }}
                        />
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Publishing...' : 'Publish Review'}
                        </button>
                    </form>
                ) : (
                    <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
                        {reviewMessage || 'Checking eligibility...'}
                    </p>
                )}
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {reviews.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No reviews yet. Be the first!</p>}
                {reviews.map(review => (
                    <div key={review.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <strong>{review.user?.name || 'Anonymous'}</strong>
                            <span style={{ color: '#FFD700' }}>{'★'.repeat(review.rating)}</span>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{review.text}</p>
                        <small style={{ color: 'var(--color-text-muted)' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}
