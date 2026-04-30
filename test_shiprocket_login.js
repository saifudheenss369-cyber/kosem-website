const email = "info@kosemperfume.com";
const password = "Fx2a8@1Avhr!t^jXpF2tL#D4NBIY4PPk";
const url = "https://apiv2.shiprocket.in/v1/payload/user/login";

async function test() {
    try {
        console.log(`Sending login request for email: ${email}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log(`Status status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error connecting to Shiprocket:", err);
    }
}

test();
