import prisma from './lib/prisma.js';
import { createShiprocketOrder } from './lib/shiprocket.js';

async function runFullTest() {
    console.log("--- Starting E2E Verification Test ---");

    try {
        // Step 1: Create a Dummy Order in the Database
        console.log("1. Creating dummy order in database...");

        // Find a product to attach
        const product = await prisma.product.findFirst();
        if (!product) throw new Error("No products found in DB for test");

        const order = await prisma.order.create({
            data: {
                userId: 1, // Assumes Admin/Guest exists
                total: product.price,
                paymentMethod: 'COD',
                shippingName: 'E2E Test User',
                shippingAddress: '123 E2E Street',
                shippingCity: 'Mumbai',
                shippingState: 'Maharashtra',
                shippingPincode: '400001',
                shippingPhone: '9999999999',
                shippingEmail: 'test@example.com',
                items: {
                    create: [{
                        productId: product.id,
                        quantity: 1,
                        price: product.price
                    }]
                }
            },
            include: { user: true, items: { include: { product: true } } }
        });

        console.log(`✅ Order created in DB (ID: ${order.id})`);

        // Step 2: Push to Shiprocket
        console.log("\n2. Pushing order to Shiprocket...");
        const srResult = await createShiprocketOrder(order);

        if (srResult.success && srResult.shiprocketOrderId !== 'MOCK_ORDER_ID') {
            console.log(`✅ Successfully synced to Shiprocket.`);
            console.log(`   Shiprocket Order ID: ${srResult.shiprocketOrderId}`);
            console.log(`   Shiprocket Shipment ID: ${srResult.shipmentId}`);

            // Step 3: Update DB with sync results
            console.log("\n3. Saving Sync IDs to DB...");
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    shiprocketOrderId: srResult.shiprocketOrderId.toString(),
                    shiprocketShipmentId: srResult.shipmentId?.toString()
                }
            });
            console.log("✅ DB updated with Shiprocket Tracking details.");

        } else {
            console.log("❌ Sync Failed (or returned MOCK IDs):", srResult);
        }

        // --- Audit Log Test ---
        console.log("\n--- Testing Audit Logs ---");
        const admin = await prisma.admin.findFirst();
        if (admin) {
            const log = await prisma.auditLog.create({
                data: {
                    action: 'TEST_E2E_VERIFICATION',
                    details: 'Automated test to verify audit logs working',
                    adminId: admin.id
                }
            });
            console.log(`✅ Audit Log explicitly generated (Log ID: ${log.id}). Admin ID: ${admin.id}`);
        } else {
            console.log("⚠️ No Admin found in DB to test Audit Logs.");
        }


    } catch (e) {
        console.error("❌ Test Failed with Exception:\n", e);
    } finally {
        await prisma.$disconnect();
    }
}

runFullTest();
