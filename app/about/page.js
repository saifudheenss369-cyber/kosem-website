import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export const metadata = {
    title: 'About Us | Kosem Perfume',
    description: 'Learn about Kosem Perfume, our story, mission, and dedication to crafting premium attar and long-lasting perfumes.',
};

export default function AboutPage() {
    return (
        <div style={{ background: 'var(--color-bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, paddingTop: '100px' }}>
                {/* Hero Section */}
                <section style={{ background: 'linear-gradient(to bottom, #050505, var(--color-bg-main))', padding: '6rem 2rem', textAlign: 'center', borderBottom: '1px solid rgba(184, 134, 11, 0.1)' }}>
                    <div className="container">
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', margin: '0 0 1rem 0', color: 'var(--color-gold)' }}>
                            About Kosem Perfume
                        </h1>
                        <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', color: 'var(--color-text-muted)', lineHeight: '1.8' }}>
                            Captivate your precious moments with our signature fragrances, in a place where tradition meets sophisticated elegance, Where tradition meets sophisticated elegance.
                        </p>
                    </div>
                </section>

                <div className="container" style={{ maxWidth: '900px', padding: '4rem 1.5rem' }}>

                    {/* Our Story */}
                    <section style={{ marginBottom: '4rem', textAlign: 'center' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-gold)' }}>Our Story</h2>
                        <div style={{ width: '60px', height: '3px', background: 'var(--color-gold)', margin: '0 auto 2rem auto' }}></div>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '1.5rem' }}>
                            Kosem Perfume was born out of a profound passion for the timeless art of perfumery. We set out on a journey to revive the ancient, meticulous craft of making breathtaking perfumes, blending it with the modern desire for distinct, long-lasting aromas.
                        </p>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.85)' }}>
                            Starting with a vision to redefine luxury perfumery, we spent countless hours sourcing the rarest ingredients—from the majestic agarwood of the East to the delicate floral notes cultivated across the globe. Today, Kosem stands as a testament to pure, alcohol-free fragrance that speaks to the soul.
                        </p>
                    </section>

                    {/* Mission & Vision Grid */}
                    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
                        <div style={{ background: 'var(--color-bg-secondary)', padding: '3rem 2rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', borderTop: '4px solid var(--color-gold)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👁️</div>
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--color-gold)' }}>Our Vision</h3>
                            <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.7' }}>
                                To become the definitive signature of diverse modern lifestyles by blending the timeless artistry of traditional perfumery with uncompromising quality, creating an eco-conscious legacy where luxury and nature thrive in perfect harmony.
                            </p>
                        </div>
                        <div style={{ background: 'var(--color-bg-secondary)', padding: '3rem 2rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', borderTop: '4px solid var(--color-gold-dim)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--color-gold)' }}>Our Mission</h3>
                            <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.7' }}>
                                To craft scents of uncompromising quality, with accordance to diverse lifestyle of our customers while honouring the rich heritage and artistry of traditional fragrance making as well as sustaining the environmental roots
                            </p>
                        </div>
                    </section>

                    {/* Why Choose Us */}
                    <section style={{ marginBottom: '4rem', background: 'var(--color-bg-secondary)', padding: '4rem 2rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2.5rem', textAlign: 'center', color: 'var(--color-gold)' }}>Why Choose Kosem?</h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '2rem' }}>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--color-gold)', fontSize: '1.5rem', lineHeight: '1' }}>✦</span>
                                <div>
                                    <strong style={{ display: 'block', marginBottom: '0.3rem', fontSize: '1.2rem', color: '#fff' }}>Signature Scents for Every Occasion</strong>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>From subtle daytime sophistication to bold evening statements, our curation is meticulously designed to match your mood, elevate your confidence, and seamlessly complement your lifestyle.</span>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--color-gold)', fontSize: '1.5rem', lineHeight: '1' }}>✦</span>
                                <div>
                                    <strong style={{ display: 'block', marginBottom: '0.3rem', fontSize: '1.2rem', color: '#fff' }}>Exceptional Longevity</strong>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>Every fragrance is richly formulated so that a single application envelopes you in a captivating aura all day long.</span>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--color-gold)', fontSize: '1.5rem', lineHeight: '1' }}>✦</span>
                                <div>
                                    <strong style={{ display: 'block', marginBottom: '0.3rem', fontSize: '1.2rem', color: '#fff' }}>Premium Ingredients</strong>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>We never compromise. Each composition features the finest selected elements—from rare oudhs to breathtaking florals.</span>
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Quality Promise */}
                    <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-gold)' }}>Our Quality Promise</h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.85)', padding: '0 1rem' }}>
                            At Kosem, quality is not a buzzword—it is our foundation. From the moment the raw ingredients are sourced until the perfume reaches your hands, our process is meticulously monitored. We promise that every bottle that bears the Kosem seal represents the culmination of artistry, patience, and absolute perfection.
                        </p>
                    </section>

                    {/* A Note From Us */}
                    <section style={{ background: 'var(--color-bg-secondary)', border: '1px solid rgba(184, 134, 11, 0.2)', padding: '4rem 3rem', borderRadius: '12px', textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-gold)', color: '#000', padding: '0.5rem 1.5rem', fontWeight: 'bold', borderRadius: '20px', fontSize: '0.85rem', letterSpacing: '2px' }}>A NOTE FROM US</div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1.5rem', marginTop: '1rem', color: 'var(--color-gold)' }}>To Our Beloved Customers</h2>
                        <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.9)', fontStyle: 'italic', marginBottom: '2rem' }}>
                            "To wear a fragrance is to wear a distinct personality. We are endlessly grateful for your trust in allowing us to be part of your most cherished memories and daily victories. We will continue to strive for perfection, ensuring you always wear your invisible crown with pride."
                        </p>
                        <p style={{ fontWeight: 'bold', color: 'var(--color-gold)', letterSpacing: '2px' }}>— THE KOSEM TEAM</p>
                    </section>

                </div>
            </main>
        </div>
    );
}
