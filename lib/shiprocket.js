// lib/shiprocket.js

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';
let cachedToken = null;
let tokenExpiry = null;

/**
 * Fetches a JWT token for Shiprocket API access
 * Caches the token in memory to avoid redundant logins
 */
export async function getShiprocketToken() {
    // Return cached token if still valid (Tokens last 240 hrs, but we use a safe 24hr buffer)
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
        return cachedToken;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        console.warn("SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD missing from environment variables.");
        return null; // Return null gracefully so local dev doesn't break
    }

    try {
        const response = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            cachedToken = data.token;
            // Shiprocket tokens last 10 days, but we cache it for 24 hours to be safe
            tokenExpiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            return cachedToken;
        } else {
            console.error("Shiprocket Login Failed:", data);
            return null;
        }
    } catch (error) {
        console.error("Shiprocket Authentication Error:", error);
        return null;
    }
}

/**
 * Checks serviceability (Delivery & COD) for a given pincode
 * @param {number} pickupPincode 
 * @param {number} deliveryPincode 
 * @param {number} weight in kg
 * @param {number} codAmount (0 if prepaid)
 * @returns {Object} { deliverable, codAvailable, message }
 */
export async function checkShiprocketServiceability(pickupPincode, deliveryPincode, weight, codAmount) {
    const token = await getShiprocketToken();
    if (!token) {
        // Return structured error if token generation fails (e.g. invalid credentials)
        return { deliverable: false, codAvailable: false, error: true, message: "Authentication Failed: Invalid Shiprocket Credentials" };
    }

    try {
        // Shiprocket's courier serviceability GET endpoint
        const params = new URLSearchParams({
            pickup_postcode: pickupPincode,
            delivery_postcode: deliveryPincode,
            weight: weight,
            cod: codAmount > 0 ? 1 : 0
        });

        const response = await fetch(`${SHIPROCKET_API_BASE}/courier/serviceability/?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.status === 200 && data.data && data.data.available_courier_companies.length > 0) {
            // Check if any courier supports COD
            const codAvailable = data.data.available_courier_companies.some(courier => courier.cod === 1);

            return {
                deliverable: true,
                codAvailable: codAmount > 0 ? codAvailable : true, // Only strictly check COD availability if COD was requested
                message: codAvailable ? "Delivery & COD Available" : "Delivery Available (Prepaid Only)"
            };
        } else {
            return {
                deliverable: false,
                codAvailable: false,
                message: "Not Deliverable to this Pincode"
            };
        }

    } catch (error) {
        console.error("Shiprocket Serviceability Error:", error);
        return { deliverable: false, codAvailable: false, message: "Error checking pincode" };
    }
}

/**
 * Creates a Custom Order in Shiprocket automatically
 * @param {Object} orderData Validated Prisma Order object containing user details and items
 */
export async function createShiprocketOrder(orderData) {
    const token = await getShiprocketToken();
    if (!token) {
        console.warn("[SHIPROCKET MOCK] Keys missing. Simulating order creation.");
        return { success: true, shiprocketOrderId: "MOCK_ORDER_ID", shipmentId: "MOCK_SHIPMENT_ID" };
    }

    try {
        const rawPhone = orderData.shippingPhone || orderData.user?.phone || "9999999999";
        const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

        const payload = {
            order_id: `KOSEM-${orderData.id}`,
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: "Home", // As returned by Shiprocket API
            billing_customer_name: orderData.shippingName || orderData.user?.name || "Customer",
            billing_last_name: "",
            billing_address: orderData.shippingAddress || orderData.user?.address || "Not Provided",
            billing_city: orderData.shippingCity || orderData.user?.city || "City",
            billing_pincode: orderData.shippingPincode || orderData.user?.zip || "110001",
            billing_state: orderData.shippingState || orderData.user?.state || "State",
            billing_country: "India",
            billing_email: orderData.shippingEmail || orderData.user?.email || "info@kosemperfume.com",
            billing_phone: cleanPhone,
            shipping_is_billing: true,

            order_items: orderData.items.map(item => ({
                name: item.product.name,
                sku: `SKU-${item.productId}`,
                units: item.quantity,
                selling_price: item.price,
                discount: "",
                tax: "",
                hsn: ""
            })),

            payment_method: orderData.paymentMethod === 'COD' ? "COD" : "Prepaid",
            sub_total: orderData.total,
            length: 10,  // Standard Package Dimensions
            breadth: 10,
            height: 10,
            weight: 0.2  // Standard Perfume Package Weight
        };

        const response = await fetch(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.status_code === 1) {
            return {
                success: true,
                shiprocketOrderId: data.order_id,
                shipmentId: data.shipment_id
            };
        } else {
            console.error("Shiprocket Order Creation Error:", data);
            return { success: false, error: data.message || "Failed to sync order to Shiprocket" };
        }

    } catch (error) {
        console.error("Shiprocket API Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Tracks a Shipment using Shiprocket's Courier Tracking API
 * @param {string} shipmentId The Shiprocket Shipment ID (e.g., returned during order creation)
 * @returns {Object} Tracking data or error
 */
export async function trackShiprocketOrder(shipmentId) {
    const token = await getShiprocketToken();
    if (!token) {
        return { success: false, error: "Authentication Failed: Invalid Shiprocket Credentials" };
    }

    try {
        const response = await fetch(`${SHIPROCKET_API_BASE}/courier/track/shipment/${shipmentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        // Shiprocket tracking returns 200 array of tracking data
        if (response.ok && data) {
            // Note: Depending on Shiprocket state, structure might be under data.tracking_data
            if (data[shipmentId] && data[shipmentId].tracking_data) {
                return { success: true, trackingData: data[shipmentId].tracking_data };
            } else if (data.tracking_data) {
                return { success: true, trackingData: data.tracking_data };
            }

            return { success: true, trackingData: data }; // Fallback
        } else {
            console.error("Shiprocket Tracking Error:", data);
            return { success: false, error: "Failed to fetch tracking data" };
        }
    } catch (error) {
        console.error("Shiprocket Tracking Execution Error:", error);
        return { success: false, error: error.message };
    }
}

/** Generate Shipping Label PDF for a shipment */
export async function generateShiprocketLabel(shipmentId) {
    const token = await getShiprocketToken();
    if (!token) return { success: false, error: 'Auth failed' };

    try {
        const response = await fetch(`${SHIPROCKET_API_BASE}/courier/generate/label`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ shipment_id: [shipmentId] })
        });
        const data = await response.json();
        if (response.ok && data.label_url) {
            return { success: true, labelUrl: data.label_url };
        }
        return { success: false, error: data.message || 'Could not generate label. Please assign a courier (AWB) first.' };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/** Assign best available courier and generate AWB for a shipment */
export async function assignShiprocketCourier(shipmentId) {
    const token = await getShiprocketToken();
    if (!token) return { success: false, error: 'Auth failed' };

    try {
        const response = await fetch(`${SHIPROCKET_API_BASE}/courier/assign/awb`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ shipment_id: shipmentId })
        });
        const data = await response.json();
        if (response.ok && data.awb_assign_status === 1) {
            return {
                success: true,
                awb: data.response?.data?.awb_code,
                courierName: data.response?.data?.courier_name,
                message: `Courier assigned: ${data.response?.data?.courier_name}`
            };
        }
        return { success: false, error: data.message || data.response?.data?.awb_assign_error || 'Could not assign courier' };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/** Generate Invoice PDF for an order */
export async function generateShiprocketInvoice(orderId) {
    const token = await getShiprocketToken();
    if (!token) return { success: false, error: 'Auth failed' };

    try {
        const response = await fetch(`${SHIPROCKET_API_BASE}/orders/print/invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ids: [orderId] })
        });
        const data = await response.json();
        if (response.ok && data.invoice_url) {
            return { success: true, invoiceUrl: data.invoice_url };
        }
        return { success: false, error: data.message || 'Could not generate invoice' };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/** Request Pickup for a shipment */
export async function requestShiprocketPickup(shipmentId) {
    const token = await getShiprocketToken();
    if (!token) return { success: false, error: 'Auth failed' };

    try {
        const response = await fetch(`${SHIPROCKET_API_BASE}/courier/generate/pickup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ shipment_id: [shipmentId] })
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, message: data.pickup_status || 'Pickup scheduled!' };
        }
        return { success: false, error: data.message || 'Pickup request failed' };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/** Cancel a Shiprocket order by Shiprocket Order ID */
export async function cancelShiprocketOrder(shiprocketOrderId) {
    const token = await getShiprocketToken();
    if (!token) return { success: false, error: 'Auth failed' };

    try {
        const response = await fetch(`${SHIPROCKET_API_BASE}/orders/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ids: [shiprocketOrderId] })
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, message: 'Order cancelled on Shiprocket' };
        }
        return { success: false, error: data.message || 'Cancel failed' };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/** Fetch Shiprocket Wallet Balance */
export async function getShiprocketWalletBalance() {
    const token = await getShiprocketToken();
    if (!token) return { success: false, error: 'Auth failed' };

    try {
        const response = await fetch(`${SHIPROCKET_API_BASE}/account/details/wallet-balance`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, balance: data.data?.wallet_balance ?? data.wallet_balance ?? 0 };
        }
        return { success: false, error: 'Failed to fetch balance' };
    } catch (err) {
        return { success: false, error: err.message };
    }
}
