const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Perfumes', slug: 'perfumes', showOnHome: true },
    { name: 'Attars', slug: 'attars', showOnHome: true },
    { name: 'Oudh', slug: 'oudh', showOnHome: true },
    { name: 'Gift Sets', slug: 'gift-sets', showOnHome: true }
  ];

  console.log('Seeding categories...');

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
    console.log(`Upserted category: ${category.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
