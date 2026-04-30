import { createShiprocketOrder } from './lib/shiprocket.js';

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
    items: [{ productId: 1, quantity: 1, price: 12000, product: { name: 'Test Product' } }]
};

createShiprocketOrder(orderData)
    .then(res => console.log(JSON.stringify(res, null, 2)))
    .catch(console.error);
