const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const occasions = [
    "12 Hours", "Daily Wear", "Date Night", "Home Fragrance",
    "Luxury Gifting", "Office", "Summer", "Wedding", "Winter"
  ];

  console.log('Seeding occasions...');

  for (const name of occasions) {
    const occ = await prisma.occasion.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    console.log(`Upserted occasion: ${occ.name}`);
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
