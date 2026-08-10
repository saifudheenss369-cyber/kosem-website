import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadBase64Image } from '@/lib/cloudinary';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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
    try {
        const products = await prisma.product.findMany();
        let updatedCount = 0;
        const logs = [];

        for (const product of products) {
            let needsUpdate = false;
            let newImages = product.images;
            let newGallery = product.gallery;

            // Check main image
            if (newImages && newImages.startsWith('data:image')) {
                try {
                    newImages = await uploadBase64Image(newImages);
                    needsUpdate = true;
                    logs.push(`Uploaded main image for product ${product.id} (${product.name})`);
                } catch (e) {
                    logs.push(`FAILED main image for product ${product.id}`);
                }
            }

            // Check gallery
            if (newGallery) {
                try {
                    const galleryArray = JSON.parse(newGallery);
                    if (Array.isArray(galleryArray)) {
                        let galleryUpdated = false;
                        const updatedGalleryArray = await Promise.all(
                            galleryArray.map(async (img) => {
                                if (img.startsWith('data:image')) {
                                    galleryUpdated = true;
                                    return await uploadBase64Image(img);
                                }
                                return img;
                            })
                        );

                        if (galleryUpdated) {
                            newGallery = JSON.stringify(updatedGalleryArray);
                            needsUpdate = true;
                            logs.push(`Uploaded gallery images for product ${product.id}`);
                        }
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }

            // Update in DB if needed
            if (needsUpdate) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        images: newImages,
                        gallery: newGallery
                    }
                });
                updatedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Migration complete. Updated ${updatedCount} products.`,
            logs
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Migration failed', details: error.message }, { status: 500 });
    }
}
