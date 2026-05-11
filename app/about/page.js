import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export const metadata = {
    title: 'About Us | Kosem Perfume',
    description: 'Learn about Kosem Perfume, our story, mission, and dedication to crafting premium attar and long-lasting perfumes.',
};

export default function AboutPage() {
    return (
        <div style={{ background: '#fcfcfc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, paddingTop: '100px' }}>
                {/* Hero Section */}
                <section style={{ background: 'var(--color-black)', color: 'white', padding: '6rem 2rem', textAlign: 'center' }}>
                    <div className="container">
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', margin: '0 0 1rem 0', color: 'var(--color-gold)' }}>
                            About Kosem Perfume
                        </h1>
                        <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', color: 'var(--color-text-muted)', lineHeight: '1.8' }}>
                            Crafting signature moments with the purest attars. Where tradition meets sophisticated elegance.
                        </p>
                    </div>
                </section>

                <div className="container" style={{ maxWidth: '900px', padding: '4rem 1.5rem' }}>

                    {/* Our Story */}
                    <section style={{ marginBottom: '4rem', textAlign: 'center' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-black)' }}>Our Story</h2>
                        <div style={{ width: '60px', height: '3px', background: 'var(--color-gold)', margin: '0 auto 2rem auto' }}></div>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Kosem Perfume was born out of a profound passion for the timeless art of perfumery. We set out on a journey to revive the ancient, meticulous craft of making authentic attars, blending it with the modern desire for distinct, long-lasting aromas.
                        </p>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--color-text-muted)' }}>
                            Starting with a vision to redefine luxury perfumery, we spent countless hours sourcing the rarest ingredients—from the majestic agarwood of the East to the delicate floral notes cultivated across the globe. Today, Kosem stands as a testament to pure, alcohol-free fragrance that speaks to the soul.
                        </p>
                    </section>

                    {/* Mission & Vision Grid */}
                    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
                        <div style={{ background: 'var(--color-bg-secondary)', padding: '3rem 2rem', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: '4px solid var(--color-gold)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👁️</div>
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--color-black)' }}>Our Vision</h3>
                            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
                                To become the ultimate destination for luxury attars globally, ensuring that every drop we create encapsulates an unforgettable experience of regal elegance and purity.
                            </p>
                        </div>
                        <div style={{ background: 'var(--color-bg-secondary)', padding: '3rem 2rem', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: '4px solid var(--color-black)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--color-black)' }}>Our Mission</h3>
                            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
                                To craft alcohol-free scents of uncompromising quality, uplifting the spirit of those who wear them, while honoring the rich heritage and artistry of traditional fragrance making.
                            </p>
                        </div>
                    </section>

                    {/* Why Choose Us */}
                    <section style={{ marginBottom: '4rem', background: 'var(--color-bg-secondary)', padding: '4rem 2rem', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--color-black)' }}>Why Choose Kosem?</h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1.5rem' }}>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--color-gold)', fontSize: '1.5rem' }}>✦</span>
                                <div>
                                    <strong style={{ display: 'block', marginBottom: '0.3rem', fontSize: '1.2rem', color: 'var(--color-black)' }}>100% Alcohol-Free Purity</strong>
                                    <span style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>We specialize in concentrated perfume oils that respect your skin and adhere strictly to faith-based purity standards.</span>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--color-gold)', fontSize: '1.5rem' }}>✦</span>
                                <div>
                                    <strong style={{ display: 'block', marginBottom: '0.3rem', fontSize: '1.2rem', color: 'var(--color-black)' }}>Exceptional Longevity</strong>
                                    <span style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>Every attar is richly formulated so that a single application envelopes you in a captivating aura all day long.</span>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--color-gold)', fontSize: '1.5rem' }}>✦</span>
                                <div>
                                    <strong style={{ display: 'block', marginBottom: '0.3rem', fontSize: '1.2rem', color: 'var(--color-black)' }}>Premium Ingredients</strong>
                                    <span style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>We never compromise. Each composition features the finest selected elements—from rare oudhs to breathtaking florals.</span>
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Quality Promise */}
                    <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-black)' }}>Our Quality Promise</h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--color-text-muted)', padding: '0 1rem' }}>
                            At Kosem, quality is not a buzzword—it is our foundation. From the moment the raw ingredients are sourced until the perfume reaches your hands, our process is meticulously monitored. We promise that every bottle that bears the Kosem seal represents the culmination of artistry, patience, and absolute perfection.
                        </p>
                    </section>

                    {/* A Note From Us */}
                    <section style={{ background: 'var(--color-black)', color: 'white', padding: '4rem 3rem', borderRadius: '12px', textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-gold)', color: 'var(--color-black)', padding: '0.5rem 1.5rem', fontWeight: 'bold', borderRadius: '20px', letterSpacing: '1px' }}>A NOTE FROM US</div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1.5rem', marginTop: '1rem', color: 'var(--color-gold)' }}>To Our Beloved Customers</h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '2rem' }}>
                            "To wear a fragrance is to wear a distinct personality. We are endlessly grateful for your trust in allowing us to be part of your most cherished memories and daily victories. We will continue to strive for perfection, ensuring you always wear your invisible crown with pride."
                        </p>
                        <p style={{ fontWeight: 'bold', color: 'var(--color-gold)', letterSpacing: '2px' }}>— THE KOSEM TEAM</p>
                    </section>

                </div>
            </main>
        </div>
    );
}
