import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");
  await prisma.article.deleteMany();

  await prisma.category.deleteMany();

  // Define categories
  const categoryNames = [
    "Monde",
    "Europe",
    "Faits-divers",
    "Politique",
    "Societe",
    "Environnement",
    "Sport",
    "Culture",
    "economie",
    "Sante",
    "Sciences",
  ];

  // Create categories
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
        },
      })
    )
  );

  console.log(
    "Categories seeded:",
    categories.map((c) => c.name)
  );

  // Create articles
  for (const category of categories) {
    const articles = Array.from({ length: 10 }).map(() => ({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      slug: faker.lorem.slug(),
      categoryId: category.id,
      author: faker.person.fullName(),
      coverImage: faker.image.url(),
    }));

    await prisma.article.createMany({
      data: articles,
    });

    console.log(`10 articles added to category: ${category.name}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
