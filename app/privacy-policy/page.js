import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
    return (
        <>
            <Navbar />
            <main style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>1. Introduction</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        Welcome to Kosem. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website
                        and tell you about your privacy rights.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>2. Data We Collect</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                            <li><strong>Identity Data:</strong> First name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> Billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Financial Data:</strong> Payment card details are processed securely by our payment gateway providers (like Instamojo) and are not stored on our servers.</li>
                            <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased from us.</li>
                        </ul>
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>3. How We Use Your Data</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling an order).</li>
                            <li>Where it is necessary for our legitimate interests and your interests do not override those.</li>
                            <li>Where we need to comply with a legal obligation.</li>
                        </ul>
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>4. Data Security</h2>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.
                        All payment transactions are encrypted using SSL technology.
                    </p>
                </section>

            </main>
            <Footer />
        </>
    );
}
