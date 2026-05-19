require('dotenv').config();

const email = process.env.SHIPROCKET_EMAIL;
const password = process.env.SHIPROCKET_PASSWORD;
const url = "https://apiv2.shiprocket.in/v1/external/auth/login";

async function test() {
    try {
        console.log(`Sending login request for email: ${email}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error connecting to Shiprocket:", err);
    }
}

test();
