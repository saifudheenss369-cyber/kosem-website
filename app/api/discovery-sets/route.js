
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { uploadBase64Image } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

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
    const id = searchParams.get('id');
    const activeOnly = searchParams.get('active') === 'true';

    try {
        if (id) {
            const set = await prisma.discoverySet.findUnique({
                where: { id: parseInt(id) },
                include: { scents: { orderBy: { createdAt: 'asc' } } }
            });
            if (!set) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(set);
        }

        const where = activeOnly ? { isActive: true } : {};
        const sets = await prisma.discoverySet.findMany({
            where,
            include: { scents: { orderBy: { createdAt: 'asc' } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(sets);
    } catch (error) {
        console.error('Discovery sets GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const body = await req.json();
        const { name, tagline, description, image, gallery, packs, features, isActive, showOnHome, scents } = body;

        if (!name || !packs) return NextResponse.json({ error: 'Name and packs are required' }, { status: 400 });

        // Process main image
        let processedImage = image || null;
        if (processedImage && processedImage.startsWith('data:image')) {
            processedImage = await uploadBase64Image(processedImage);
        }

        // Process gallery
        let processedGallery = gallery || null;
        if (processedGallery) {
            let galleryArray = [];
            try { galleryArray = JSON.parse(processedGallery); } catch (e) { galleryArray = []; }
            if (galleryArray.length > 0) {
                const uploaded = await Promise.all(
                    galleryArray.map(async (img) => {
                        if (img.startsWith('data:image')) return await uploadBase64Image(img);
                        return img;
                    })
                );
                processedGallery = JSON.stringify(uploaded);
            }
        }

        // Process scent images
        let scentData = [];
        if (scents && Array.isArray(scents)) {
            for (const s of scents) {
                let scentImage = s.image || null;
                if (scentImage && scentImage.startsWith('data:image')) {
                    scentImage = await uploadBase64Image(scentImage);
                }
                scentData.push({ name: s.name, image: scentImage });
            }
        }

        const set = await prisma.discoverySet.create({
            data: {
                name,
                tagline: tagline || null,
                description: description || null,
                image: processedImage,
                gallery: processedGallery,
                packs: typeof packs === 'string' ? packs : JSON.stringify(packs),
                features: features || null,
                isActive: isActive !== false,
                showOnHome: Boolean(showOnHome),
                scents: {
                    create: scentData
                }
            },
            include: { scents: true }
        });

        await logAudit('CREATE_DISCOVERY_SET', `Created discovery set: ${name}`, 1);
        return NextResponse.json(set, { status: 201 });
    } catch (error) {
        console.error('Discovery set create error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create' }, { status: 500 });
    }
}

export async function PUT(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const body = await req.json();
        const { id, name, tagline, description, image, gallery, packs, features, isActive, showOnHome, scents } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Process main image
        let processedImage = image;
        if (processedImage && processedImage.startsWith('data:image')) {
            processedImage = await uploadBase64Image(processedImage);
        }

        // Process gallery
        let processedGallery = gallery;
        if (processedGallery) {
            let galleryArray = [];
            try { galleryArray = JSON.parse(processedGallery); } catch (e) { galleryArray = []; }
            if (galleryArray.length > 0) {
                const uploaded = await Promise.all(
                    galleryArray.map(async (img) => {
                        if (img.startsWith('data:image')) return await uploadBase64Image(img);
                        return img;
                    })
                );
                processedGallery = JSON.stringify(uploaded);
            }
        }

        // Update the set
        const set = await prisma.discoverySet.update({
            where: { id: parseInt(id) },
            data: {
                name,
                tagline: tagline || null,
                description: description || null,
                image: processedImage !== undefined ? processedImage : undefined,
                gallery: processedGallery !== undefined ? processedGallery : undefined,
                packs: packs ? (typeof packs === 'string' ? packs : JSON.stringify(packs)) : undefined,
                features: features !== undefined ? features : undefined,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined,
                showOnHome: showOnHome !== undefined ? Boolean(showOnHome) : undefined,
            }
        });

        // Update scents: delete existing and recreate
        if (scents && Array.isArray(scents)) {
            await prisma.discoveryScent.deleteMany({ where: { discoverySetId: parseInt(id) } });

            for (const s of scents) {
                let scentImage = s.image || null;
                if (scentImage && scentImage.startsWith('data:image')) {
                    scentImage = await uploadBase64Image(scentImage);
                }
                await prisma.discoveryScent.create({
                    data: { name: s.name, image: scentImage, discoverySetId: parseInt(id) }
                });
            }
        }

        const updatedSet = await prisma.discoverySet.findUnique({
            where: { id: parseInt(id) },
            include: { scents: true }
        });

        await logAudit('UPDATE_DISCOVERY_SET', `Updated discovery set ID ${id}: ${name}`);
        return NextResponse.json(updatedSet);
    } catch (error) {
        console.error('Discovery set update error:', error);
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.discoverySet.delete({ where: { id: parseInt(id) } });
        await logAudit('DELETE_DISCOVERY_SET', `Deleted discovery set ID ${id}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Discovery set delete error:', error);
        return NextResponse.json({ error: 'Delete failed', details: error.message }, { status: 500 });
    }
}
