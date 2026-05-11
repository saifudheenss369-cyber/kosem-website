import { NextResponse } from 'next/server';
import { createShiprocketOrder } from '@/lib/shiprocket';

export async function GET() {
    const orderData = {
        id: 35,
        total: 12000,
        paymentMethod: 'COD',
        shippingName: 'faizal ummer',
        shippingAddress: 'ddacdsafafas',
        shippingCity: 'fvvvafv',
        shippingState: ' xfdvbefgef',
        shippingPincode: '345676',
        shippingPhone: '9567598321',
        shippingEmail: 'faizalummer47@gmail.com',
        user: { name: 'faizal ummer' },
        items: [{ productId: 1, quantity: 1, price: 12000, product: { name: 'Test Product' } }]
    };

    try {
        const res = await createShiprocketOrder(orderData);
        return NextResponse.json({ success: true, res });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
