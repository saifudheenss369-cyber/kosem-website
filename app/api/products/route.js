
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Increase timeout




const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Helper to verify admin
async function isAdmin() {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) return false;

    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        return decoded.role === 'ADMIN';
    } catch (err) {
        return false;
    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const isBestSeller = searchParams.get('bestSeller') === 'true';
    const query = searchParams.get('q');
    const category = searchParams.get('category'); // Can be comma-separated
    const occasionsParam = searchParams.get('occasions'); // Comma-separated
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    try {
        const where = {};
        if (isBestSeller) where.isBestSeller = true;

        if (category && category !== 'All') {
            const catArray = category.split(',').map(c => c.trim()).filter(c => c);
            if (catArray.length > 0) {
                where.category = { in: catArray };
            }
        }

        if (occasionsParam) {
            const occArray = occasionsParam.split(',').map(o => o.trim()).filter(o => o);
            if (occArray.length > 0) {
                // If any of the selected occasions are in the product's occasions string
                where.OR = occArray.map(occ => ({
                    occasions: { contains: occ }
                }));
            }
        }

        if (query) {
            const queryCondition = [
                { name: { contains: query } },
                { description: { contains: query } }
            ];
            // if where.OR already exists (from occasions), we must use where.AND
            if (where.OR) {
                where.AND = [
                    { OR: where.OR },
                    { OR: queryCondition }
                ];
                delete where.OR; // Move OR into AND
            } else {
                where.OR = queryCondition;
            }
        }

        // Add price filters
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        let orderBy = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        else if (sort === 'price_desc') orderBy = { price: 'desc' };

        const groupVariants = searchParams.get('groupVariants') === 'true';

        const products = await prisma.product.findMany({
            where: where,
            orderBy: orderBy,
        });

        if (groupVariants) {
            const bestVariantMap = new Map();
            for (const p of products) {
                if (p.variantGroupId) {
                    if (!bestVariantMap.has(p.variantGroupId)) {
                        bestVariantMap.set(p.variantGroupId, p);
                    } else {
                        const currentBest = bestVariantMap.get(p.variantGroupId);
                        if (p.isMainVariant && !currentBest.isMainVariant) {
                            bestVariantMap.set(p.variantGroupId, p);
                        } else if (p.isMainVariant === currentBest.isMainVariant) {
                            if (currentBest.stock <= 0 && p.stock > 0) {
                                bestVariantMap.set(p.variantGroupId, p);
                            }
                        }
                    }
                }
            }

            const seenGroups = new Set();
            const result = [];
            for (const p of products) {
                if (!p.variantGroupId) {
                    result.push(p);
                } else if (!seenGroups.has(p.variantGroupId)) {
                    seenGroups.add(p.variantGroupId);
                    result.push(bestVariantMap.get(p.variantGroupId));
                }
            }
            return NextResponse.json(result);
        }

        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(req) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, description, price, stock, category, occasions, images, rating, isBestSeller, originalPrice, fakeRatingCount, isInCarousel, isInHero, showStockCount, size, variantGroupId, similarProductIds, gallery, isMainVariant } = body;

        // Validation for required fields
        if (!name || !price || !stock || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description: description || '',
                price: parseFloat(price),
                stock: parseInt(stock),
                category,
                occasions: occasions || '',
                images: images || '',
                images: images || '',
                rating: isNaN(parseFloat(rating)) ? 0 : parseFloat(rating),
                isBestSeller: Boolean(isBestSeller),
                isMainVariant: Boolean(isMainVariant),
                size: size || null,
                variantGroupId: variantGroupId || null,
                similarProductIds: similarProductIds || null,
                gallery: gallery || null,
                showStockCount: showStockCount !== undefined ? Boolean(showStockCount) : true,
                originalPrice: (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : null,
                fakeRatingCount: (fakeRatingCount && !isNaN(parseInt(fakeRatingCount))) ? parseInt(fakeRatingCount) : 0,
                isInCarousel: Boolean(isInCarousel),
                isInHero: Boolean(isInHero)
            }
        });

        // Log action
        await logAudit('CREATE_PRODUCT', `Created product: ${name}`, 1); // Default admin ID for now

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Product create error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
    }
}

export async function PUT(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const idFromParams = searchParams.get('id'); // Renamed to avoid conflict with 'id' from body

    try {
        const body = await req.json();
        const { name, description, price, stock, category, occasions, images, rating, isBestSeller, originalPrice, fakeRatingCount, isInCarousel, isInHero, showStockCount, size, variantGroupId, similarProductIds, gallery, isMainVariant } = body;

        // Use id from body if provided, otherwise fallback to id from searchParams
        const productId = idFromParams || body.id;

        if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

        const product = await prisma.product.update({
            where: { id: parseInt(productId) },
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                category,
                occasions: occasions !== undefined ? occasions : undefined,
                images,
                rating: isNaN(parseFloat(rating)) ? 0 : parseFloat(rating),
                isBestSeller: Boolean(isBestSeller),
                size: size !== undefined ? size : null,
                variantGroupId: variantGroupId !== undefined ? variantGroupId : null,
                similarProductIds: similarProductIds !== undefined ? similarProductIds : null,
                gallery: gallery !== undefined ? gallery : null,
                ...(isMainVariant !== undefined && { isMainVariant: Boolean(isMainVariant) }),
                ...(showStockCount !== undefined && { showStockCount: Boolean(showStockCount) }),
                ...(originalPrice !== undefined && { originalPrice: (originalPrice && !isNaN(parseFloat(originalPrice))) ? parseFloat(originalPrice) : null }),
                ...(fakeRatingCount !== undefined && { fakeRatingCount: (fakeRatingCount && !isNaN(parseInt(fakeRatingCount))) ? parseInt(fakeRatingCount) : 0 }),
                ...(isInCarousel !== undefined && { isInCarousel: Boolean(isInCarousel) }),
                ...(isInHero !== undefined && { isInHero: Boolean(isInHero) })
            }
        });
        await logAudit('UPDATE_PRODUCT', `Updated product ID ${productId}: ${name}`);
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
        await prisma.product.delete({ where: { id: parseInt(id) } });
        await logAudit('DELETE_PRODUCT', `Deleted product ID ${id}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
