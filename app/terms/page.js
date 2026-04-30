import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsAndConditions() {
    return (
        <>
            <Navbar />
            <main style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Terms & Conditions</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>1. Introduction</h2>
                    <p style={{ color: '#444', lineHeight: '1.8' }}>
                        Welcome to Kosem. These terms and conditions outline the rules and regulations for the use of Kosem's Website, located at kosemperfume.com.
                        By accessing this website we assume you accept these terms and conditions. Do not continue to use Kosem if you do not agree to take all of the terms and conditions stated on this page.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>2. User Accounts</h2>
                    <p style={{ color: '#444', lineHeight: '1.8' }}>
                        When you create an account with us, you must provide us with information that is accurate, complete, and current at all times.
                        Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        You are responsible for safeguarding the password that you use to access the Service.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>3. Purchases and Payments</h2>
                    <p style={{ color: '#444', lineHeight: '1.8' }}>
                        If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
                        <br /><br />
                        You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct and complete.
                        We may employ the use of third party services for the purpose of facilitating payment and the completion of Purchases (e.g. Instamojo).
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>4. Products and Pricing</h2>
                    <p style={{ color: '#444', lineHeight: '1.8' }}>
                        All products are subject to availability. We reserve the right to discontinue any product at any time for any reason.
                        Prices for all products are subject to change.
                    </p>
                </section>

            </main>
            <Footer />
        </>
    );
}
