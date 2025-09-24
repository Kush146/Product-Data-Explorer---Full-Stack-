// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function upsertCategory(params: {
  navigationId: string;
  slug: string;
  title: string;
  parentId?: string | null; // null for root
}) {
  const { navigationId, slug, title, parentId = null } = params;

  if (parentId === null) {
    // Can't use upsert with a composite unique where containing null
    const existing = await prisma.category.findFirst({
      where: { navigationId, slug, parentId: null },
    });

    if (existing) {
      return prisma.category.update({
        where: { id: existing.id },
        data: { title, lastScrapedAt: new Date() },
      });
    }

    return prisma.category.create({
      data: {
        navigationId,
        slug,
        title,
        parentId: null,
        lastScrapedAt: new Date(),
      },
    });
  }

  // Non-root: safe to use upsert
  return prisma.category.upsert({
    where: {
      navigationId_slug_parentId: { navigationId, slug, parentId },
    },
    update: { title, lastScrapedAt: new Date() },
    create: {
      navigationId,
      slug,
      title,
      parentId,
      lastScrapedAt: new Date(),
    },
  });
}

// tiny helper so product upserts are concise
async function upsertProduct(data: {
  sourceId: string;
  sourceUrl: string; // required by your Product model
  title: string;
  author: string;
  price: string;     // string per your schema
  currency: string;
  imageUrl: string;
  categoryId: string;
}) {
  const { sourceId, ...rest } = data;

  return prisma.product.upsert({
    where: { sourceId },
    update: { ...rest, lastScrapedAt: new Date() },
    create: { sourceId, ...rest, lastScrapedAt: new Date() },
  });
}

async function main() {
  // 1) Navigation
  const nav = await prisma.navigation.upsert({
    where: { slug: 'books' },
    update: { title: 'Books', lastScrapedAt: new Date() },
    create: { slug: 'books', title: 'Books', lastScrapedAt: new Date() },
  });

  // 2) Categories
  const fiction = await upsertCategory({
    navigationId: nav.id,
    slug: 'fiction',
    title: 'Fiction',
    parentId: null, // root
  });

  const classics = await upsertCategory({
    navigationId: nav.id,
    slug: 'classics',
    title: 'Classics',
    parentId: fiction.id, // child of Fiction
  });

  const dystopian = await upsertCategory({
    navigationId: nav.id,
    slug: 'dystopian',
    title: 'Dystopian',
    parentId: fiction.id, // child of Fiction
  });

  // 3) Products (add more as needed)
  await upsertProduct({
    sourceId: 'seed-1984',
    sourceUrl: 'https://example.com/products/1984',
    title: '1984',
    author: 'George Orwell',
    price: '5.99',
    currency: 'GBP',
    imageUrl: 'https://placehold.co/300x400?text=1984',
    categoryId: classics.id,
  });

  await upsertProduct({
    sourceId: 'seed-brave-new-world',
    sourceUrl: 'https://example.com/products/brave-new-world',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    price: '6.49',
    currency: 'GBP',
    imageUrl: 'https://placehold.co/300x400?text=Brave+New+World',
    categoryId: dystopian.id, // or classics.id if you prefer
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    throw e; // no process.exit to avoid Node types warning
  });
