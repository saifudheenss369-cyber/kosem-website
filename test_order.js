const { createShiprocketOrder } = require('./lib/shiprocket.js');
const fetch = require('node-fetch');

// Need to inject fetch into global if not next.js environment
global.fetch = fetch;

// Mock environment variables for testing
process.env.SHIPROCKET_EMAIL = "info@kosemperfume.com";
process.env.SHIPROCKET_PASSWORD = "Fx2a8@1Avhr!t^jXpF2tL#D4NBIY4PPk";

async function runTest() {
    const fakeOrder = {
        id: "TEST-CMD-001",
        total: 999,
        paymentMethod: "COD",
        user: {
            name: "Test User",
            address: "123 API Test Lane",
            city: "New Delhi",
            state: "Delhi",
            zip: "110001",
            email: "test@kosemperfume.com",
            phone: "9876543210"
        },
        items: [
            {
                product: { name: "Test Oud" },
                productId: "OUD001",
                quantity: 1,
                price: 999
            }
        ]
    };

    console.log("Mocking Order Creation...");
    const result = await createShiprocketOrder(fakeOrder);
    console.log(result);
}

runTest();
