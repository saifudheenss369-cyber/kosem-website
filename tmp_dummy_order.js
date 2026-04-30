const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    let product = await prisma.product.findFirst();
    let product2 = await prisma.product.findFirst({ skip: 1 });
    
    if (!product) {
        product = await prisma.product.create({
            data: {
                name: 'Majestic Oudh 12ml',
                description: 'Premium product',
                price: 1250,
                stock: 50,
                category: 'Oudh',
                images: '["/hero-box.jpg"]'
            }
        });
    }
    
    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: {
                name: 'Mohammed Faizy',
                phone: '9747209278',
                role: 'ADMIN' // Just to make sure we don't accidentally create an invalid user
            }
        });
    }

    const order = await prisma.order.create({
        data: {
            userId: user.id,
            status: 'PENDING',
            total: 2500,
            paymentMethod: 'ONLINE',
            shippingMethod: 'EXPRESS',
            shippingName: 'Faizy Ahamed',
            shippingPhone: '+919747209278',
            shippingAddress: 'Villa No 45, Golden Avenue, MG Road near City Center',
            shippingCity: 'Kochi',
            shippingState: 'Kerala',
            shippingPincode: '682035',
            items: {
                create: [
                    { productId: product.id, quantity: 2, price: product.price }
                ]
            }
        }
    });

    console.log('Detailed dummy order created:', order.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
