import prisma from '@/lib/prisma';

export default async function sitemap() {
    const baseUrl = 'https://kosemperfume.com';

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/shop',
        '/track-order',
        '/login',
        '/register',
        '/about',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1.0 : 0.8,
    }));

    // 2. Dynamic Product Routes
    let productRoutes = [];
    try {
        const products = await prisma.product.findMany({
            select: { id: true }
        });
        productRoutes = products.map((product) => ({
            url: `${baseUrl}/product/${product.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));
    } catch (e) {
        console.error("Sitemap generation: Failed to fetch products", e);
    }

    // 3. Dynamic Category Routes (Optional SEO booster)
    let categoryRoutes = [];
    try {
        const categories = await prisma.category.findMany({
            select: { name: true }
        });
        categoryRoutes = categories.map((cat) => ({
            url: `${baseUrl}/shop?category=${encodeURIComponent(cat.name)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        }));
    } catch (e) {
        console.error("Sitemap generation: Failed to fetch categories", e);
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
