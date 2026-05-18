// Use global fetch

async function placeTestOrder() {
    console.log('Placing test COD order on live site...');
    try {
        const res = await fetch('https://kosemperfumes.com/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Saifudheen Test',
                address: 'Test House, Near mosque',
                district: 'Malappuram',
                state: 'Kerala',
                pincode: '676505',
                phone: '7736791961',
                email: 'saifudheenss369@gmail.com',
                items: [
                    {
                        productId: 1, //wisal dhahab or other
                        quantity: 1,
                        price: 500
                    }
                ],
                total: 500,
                paymentMethod: 'COD',
                shippingMethod: 'STANDARD'
            })
        });

        const data = await res.json();
        console.log('API Response:', data);

    } catch (err) {
        console.error('Error placing order:', err);
    }
}

placeTestOrder();
