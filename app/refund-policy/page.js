import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RefundPolicy() {
    return (
        <>
            <Navbar />
            <main style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Cancellation & Refund Policy</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>1. No General Returns or Refunds</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        At Kosem, we deal in premium quality Attars and Oudh. Due to the personal care and hygienic nature of our products,
                        <strong> we do not accept returns or provide refunds if you simply did not like the fragrance.</strong>
                        <br /><br />
                        Perfumes are subjective, and we highly recommend ordering smaller quantities or sample packs (if available) before committing to a larger purchase. Once a product is shipped and delivered, the sale is considered final.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>2. Exceptions: Damaged or Incorrect Items</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        The only exception to our No Refund policy is in the rare case that you receive a defective, damaged, or incorrect item.
                        <br /><br />
                        To be eligible for a replacement or refund for a damaged/incorrect item, you MUST:
                        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                            <li>Provide a clear, <strong>uncut unboxing video</strong> from the moment the sealed package is opened.</li>
                            <li>Notify us within <strong>24 hours</strong> of the delivery time marked by our courier partner.</li>
                            <li>Ensure the product remains unused and exactly in the condition you received it.</li>
                        </ul>
                        If these conditions are met, our team will review the evidence. If approved, we will initiate a replacement. If a replacement is unavailable, we will process a refund to your original payment method within 5-7 business days.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>3. Order Cancellation</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        Orders can only be cancelled <strong>before they are dispatched</strong> from our warehouse.
                        If you wish to cancel an order, please contact us immediately via WhatsApp or Email.
                        Once the order status is updated to "Shipped", it cannot be cancelled or altered under any circumstances.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-bg-secondary)', borderLeft: '4px solid var(--color-gold)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#111' }}>Contact Us for Claims</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.5', margin: 0 }}>
                        If you received a damaged item, please email your unboxing video and order details to: <strong>support@kosemperfume.com</strong>
                    </p>
                </section>

            </main>
            <Footer />
        </>
    );
}
