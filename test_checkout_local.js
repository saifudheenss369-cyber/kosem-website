async function test() {
    try {
        const response = await fetch("http://localhost:3000/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: "test user",
                address: "test address",
                district: "test district",
                state: "test state",
                pincode: "400001",
                phone: "9999999999",
                email: "test@example.com",
                items: [{ "productId": 1, "quantity": 1, "price": 100 }],
                total: 100,
                paymentMethod: "COD",
                shippingMethod: "STANDARD"
            })
        });
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Body:", text);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
test();
