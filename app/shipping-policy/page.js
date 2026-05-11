import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ShippingPolicy() {
    return (
        <>
            <Navbar />
            <main style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Shipping & Delivery Policy</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>1. Order Processing Time</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped, along with an AWB tracking number.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>2. Shipping Rates and Estimates</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        Shipping charges for your order will be calculated and displayed at checkout.
                        <br /><br />
                        <strong>Standard Delivery:</strong> Delivery within 3-7 business days depending on your location in India.
                        <br />
                        <strong>Express Delivery:</strong> Depending on courier availability, delivery within 2-4 business days.
                        <br /><br />
                        <em>*Please note that delivery delays can occasionally occur due to unforeseen external factors (e.g., extreme weather, logistical issues at the courier end).</em>
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>3. How do I check the status of my order?</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        When your order has shipped, you will receive an email and/or SMS notification from us which will include a tracking number you can use to check its status. Please allow 24 hours for the tracking information to become available.
                        <br /><br />
                        You can also log into your account on our website and view your order history to track your package in real-time.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>4. Shipping Restrictions</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        Currently, we only ship within India. We do not offer international shipping at this time.
                    </p>
                </section>

            </main>
            <Footer />
        </>
    );
}
