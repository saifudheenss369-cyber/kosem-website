'use client';

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                    <h2>Global Error</h2>
                    <p>{error.message}</p>
                    <button onClick={() => reset()}>Try again</button>
                </div>
            </body>
        </html>
    );
}
