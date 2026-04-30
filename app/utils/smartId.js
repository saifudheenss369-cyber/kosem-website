export function getSmartId(order) {
    if (!order) return '';
    const dateStr = new Date(order.createdAt);
    const yy = String(dateStr.getFullYear()).slice(-2);
    const dd = String(dateStr.getDate()).padStart(2, '0');
    const mm = String(dateStr.getMonth() + 1).padStart(2, '0');
    
    let alphabet = 'N';
    switch (order.status) {
        case 'PENDING': alphabet = 'N'; break;
        case 'PROCESSING': alphabet = 'P'; break;
        case 'SHIPPED': alphabet = 'S'; break;
        case 'DELIVERED': alphabet = 'F'; break;
        case 'CANCELLED': alphabet = 'C'; break;
        case 'OUT_OF_STOCK': alphabet = 'O'; break;
        case 'ERROR': alphabet = 'E'; break;
        case 'HOLD': alphabet = 'H'; break;
        default: alphabet = 'N'; break;
    }
    
    // Fallback if order.id is undefined (though shouldn't happen)
    const id = order.id || '000';
    
    return `AJ${id}${yy}${alphabet}${dd}${mm}`;
}

export function parseSmartId(input) {
    if (!input) return null;
    const str = String(input).trim().toUpperCase();
    
    // If it's already just a number
    if (/^\d+$/.test(str)) {
        return parseInt(str, 10);
    }
    
    // Smart ID format: AJ + [ID] + [YY] + [Status] + [DDMM]
    // Example: AJ12026N2804
    if (str.startsWith('AJ')) {
        const withoutPrefix = str.substring(2); // "12026N2804"
        const match = withoutPrefix.match(/^(\d+)([A-Z])/); // Group 1: "12026", Group 2: "N"
        if (match && match[1].length > 2) {
            const idWithYear = match[1];
            // Remove the last 2 digits (which represent YY)
            const realId = idWithYear.slice(0, -2);
            return parseInt(realId, 10);
        }
    }
    
    return NaN;
}
