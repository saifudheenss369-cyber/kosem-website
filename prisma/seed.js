const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.admin.upsert({
        where: { email: 'admin@attar.com' },
        update: {},
        create: {
            email: 'admin@attar.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN' // Kept for consistency
        },
    });

    console.log({ admin });

    // 1. Categories
    const categories = [
        { name: 'Attar', showOnHome: false },
        { name: 'Oudh', showOnHome: false },
        { name: 'Men', showOnHome: false },
        { name: 'Women', showOnHome: false },
        { name: 'Premium', showOnHome: true },
        { name: 'Luxury', showOnHome: true },
        { name: 'Unisex', showOnHome: false },
        { name: 'Gift Sets', showOnHome: false },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: { showOnHome: cat.showOnHome },
            create: {
                name: cat.name,
                slug: cat.name.toLowerCase().replace(/ /g, '-'),
                showOnHome: cat.showOnHome
            }
        });
    }

    // 2. Products
    const dummyProducts = [
        // --- BEST SELLERS (Mix of categories) ---
        {
            name: "Royal Oudh",
            description: "A rich, woody fragrance derived from the finest Agarwood.",
            price: 4999,
            originalPrice: 6500,
            stock: 50,
            category: "Oudh",
            images: "https://images.unsplash.com/photo-1594035910387-406691aa6681?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            fakeRatingCount: 142,
            isBestSeller: true
        },
        {
            name: "Rose Musk",
            description: "A delicate blend of fresh roses and soft musk.",
            price: 1200,
            originalPrice: 1599,
            stock: 100,
            category: "Attar",
            images: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            fakeRatingCount: 89,
            isBestSeller: true
        },
        {
            name: "Amber Gold",
            description: "Warm, resinous amber with hints of vanilla.",
            price: 3200,
            originalPrice: 4000,
            stock: 40,
            category: "Attar",
            images: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            fakeRatingCount: 204,
            isBestSeller: true
        },
        {
            name: "White Musk",
            description: "Clean, fresh, and powdery scent.",
            price: 850,
            stock: 150,
            category: "Unisex",
            images: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80",
            rating: 4.4,
            isBestSeller: true
        },

        // --- MEN ---
        {
            name: "Black Musk Intense",
            description: "Strong, masculine musk with woody undertones.",
            price: 1500,
            category: "Men",
            images: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80",
            rating: 4.7,
            fakeRatingCount: 55,
            isBestSeller: false
        },
        {
            name: "Cedrat Boise",
            description: "Citrusy and woody, perfect for the modern man.",
            price: 2200,
            category: "Men",
            images: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
            rating: 4.6,
            fakeRatingCount: 32,
            isBestSeller: false
        },
        {
            name: "Sandalwood King",
            description: "Pure sandalwood oil, creamy and majestic.",
            price: 2800,
            category: "Men",
            images: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            fakeRatingCount: 41,
            isBestSeller: false
        },
        {
            name: "Ocean Breeze",
            description: "Fresh aquatic notes with a hint of citrus.",
            price: 999,
            category: "Men",
            images: "https://images.unsplash.com/photo-1594035910387-406691aa6681?auto=format&fit=crop&w=800&q=80",
            rating: 4.3,
            fakeRatingCount: 19,
            isBestSeller: false
        },
        {
            name: "Spice Bomb Alt",
            description: "Explosive spices with tobacco and leather.",
            price: 3500,
            category: "Men",
            images: "https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            fakeRatingCount: 60,
            isBestSeller: true
        },

        // --- WOMEN ---
        {
            name: "Velvet Rose",
            description: "Soft rose petals with a hint of vanilla.",
            price: 1800,
            category: "Women",
            images: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            fakeRatingCount: 120,
            isBestSeller: true
        },
        {
            name: "Jasmine Pearl",
            description: "Pure jasmine extract, floral and elegant.",
            price: 2000,
            category: "Women",
            images: "https://images.unsplash.com/photo-1608528577891-9f0464e83791?auto=format&fit=crop&w=800&q=80",
            rating: 4.5,
            fakeRatingCount: 40,
            isBestSeller: false
        },
        {
            name: "Vanilla Orchid",
            description: "Sweet vanilla bean with floral orchid notes.",
            price: 1400,
            category: "Women",
            images: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80",
            rating: 4.7,
            fakeRatingCount: 88,
            isBestSeller: true
        },
        {
            name: "Pink Musk",
            description: "Playful and fruity musk for everyday wear.",
            price: 950,
            category: "Women",
            images: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80",
            rating: 4.4,
            fakeRatingCount: 25,
            isBestSeller: false
        },
        {
            name: "Gardenia Bloom",
            description: "Authentic white floral scent.",
            price: 1600,
            category: "Women",
            images: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
            rating: 4.6,
            fakeRatingCount: 30,
            isBestSeller: false
        },

        // --- PREMIUM ---
        {
            name: "Dehn Al Oudh Cambodi",
            description: "Aged 15 years, this Cambodian Oudh is for the connoisseur.",
            price: 15000,
            category: "Premium",
            images: "https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            fakeRatingCount: 12,
            isBestSeller: false
        },
        {
            name: "Taif Rose Oil",
            description: "The rarest rose oil from the mountains of Taif.",
            price: 8000,
            category: "Premium",
            images: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            fakeRatingCount: 8,
            isBestSeller: false
        },
        {
            name: "Musk Al Ghazal",
            description: "Legendary black musk, intensely animalic and long lasting.",
            price: 12000,
            category: "Premium",
            images: "https://images.unsplash.com/photo-1594035910387-406691aa6681?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            fakeRatingCount: 5,
            isBestSeller: true
        },
        {
            name: "Ambergris Pure",
            description: "Authentic floating gold of the ocean.",
            price: 25000,
            category: "Premium",
            images: "https://images.unsplash.com/photo-1595181180292-1b15ce80119e?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            fakeRatingCount: 3,
            isBestSeller: false
        },
        {
            name: "Saffron Royal",
            description: "The red gold of spices, distilled into a pure oil.",
            price: 6500,
            category: "Premium",
            images: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            fakeRatingCount: 15,
            isBestSeller: false
        },

        // --- UNISEX ---
        {
            name: "White Amber",
            description: "A neutral, clean amber scent loved by all.",
            price: 1300,
            category: "Unisex",
            images: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80",
            rating: 4.4,
            fakeRatingCount: 200,
            isBestSeller: true
        },
        {
            name: "Patchouli Earth",
            description: "Earthy, grounding, and mysterious.",
            price: 1100,
            category: "Unisex",
            images: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80",
            rating: 4.2,
            fakeRatingCount: 45,
            isBestSeller: false
        },
        {
            name: "Citrus Grove",
            description: "Burst of lemon, lime and bergamot.",
            price: 899,
            category: "Unisex",
            images: "https://images.unsplash.com/photo-1608528577891-9f0464e83791?auto=format&fit=crop&w=800&q=80",
            rating: 4.5,
            fakeRatingCount: 60,
            isBestSeller: false
        },
        {
            name: "Lavender Fields",
            description: "Calming lavender with a herbal twist.",
            price: 1050,
            category: "Unisex",
            images: "https://images.unsplash.com/photo-1595181180292-1b15ce80119e?auto=format&fit=crop&w=800&q=80",
            rating: 4.6,
            fakeRatingCount: 70,
            isBestSeller: false
        },
        {
            name: "Mukhallat Emirates",
            description: "A traditional blend of rose, saffron and oudh.",
            price: 2100,
            category: "Unisex",
            images: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=800&q=80",
            rating: 4.7,
            fakeRatingCount: 110,
            isBestSeller: true
        },

        // --- GIFT SETS ---
        {
            name: "Luxury 3-Piece Set",
            description: "Includes Royal Oudh, Rose Musk, and Amber Gold.",
            price: 5999,
            category: "Gift Sets",
            images: "https://images.unsplash.com/photo-1595181180292-1b15ce80119e?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            fakeRatingCount: 15,
            isBestSeller: true
        },
        {
            name: "Floral Collection",
            description: "Set of 5 floral attars: Rose, Jasmine, Lotus, Gardenia, Lily.",
            price: 3500,
            category: "Gift Sets",
            images: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            fakeRatingCount: 22,
            isBestSeller: false
        },
        {
            name: "The Oudh Edit",
            description: "Discovery set of 3 premium Oudh oils.",
            price: 9999,
            category: "Gift Sets",
            images: "https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            fakeRatingCount: 10,
            isBestSeller: true
        },
        {
            name: "Beginner's Pack",
            description: "Light and fresh scents for those new to attar.",
            price: 1999,
            category: "Gift Sets",
            images: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80",
            rating: 4.6,
            fakeRatingCount: 40,
            isBestSeller: false
        },
        {
            name: "Wedding Hamper",
            description: "Grand box with perfumes, burner, and bakhoor.",
            price: 15000,
            category: "Gift Sets",
            images: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            fakeRatingCount: 5,
            isBestSeller: false
        },

        // --- LUXURY ---
        {
            name: "Imperial Oudh",
            description: "A majestic blend of aged oudh and rare spices.",
            price: 25000,
            category: "Luxury",
            images: "https://images.unsplash.com/photo-1594035910387-406691aa6681?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            fakeRatingCount: 3,
            isBestSeller: false
        },
        {
            name: "Golden Amber Reserve",
            description: "Exclusive amber extract, aged for 10 years.",
            price: 18000,
            category: "Luxury",
            images: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            fakeRatingCount: 7,
            isBestSeller: true
        },
        {
            name: "Rose de Mai Absolute",
            description: "The pure essence of May Rose, limited edition.",
            price: 12000,
            category: "Luxury",
            images: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            fakeRatingCount: 12,
            isBestSeller: false
        },
        {
            name: "Santal Royal",
            description: "Rich and creamy Mysore Sandalwood oil.",
            price: 9500,
            category: "Luxury",
            images: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            fakeRatingCount: 20,
            isBestSeller: false
        },
        {
            name: "Musk Nobility",
            description: "An aristocratic musk blend for the elite.",
            price: 8500,
            category: "Luxury",
            images: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80",
            rating: 4.7,
            fakeRatingCount: 15,
            isBestSeller: true
        }
    ];

    for (const product of dummyProducts) {
        await prisma.product.create({
            data: product
        });
    }

    console.log(`Added ${dummyProducts.length} dummy products`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
