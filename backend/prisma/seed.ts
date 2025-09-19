import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create sample navigation
  const nav1 = await prisma.navigation.create({
    data: {
      name: 'Electronics',
      url: 'https://example.com/electronics',
      source_id: 'nav1',
      source_url: 'https://example.com/electronics',
    },
  });

  const nav2 = await prisma.navigation.create({
    data: {
      name: 'Clothing',
      url: 'https://example.com/clothing',
      source_id: 'nav2',
      source_url: 'https://example.com/clothing',
    },
  });

  // Create sample categories
  const cat1 = await prisma.category.create({
    data: {
      name: 'Smartphones',
      navigationId: nav1.id,
      source_id: 'cat1',
      source_url: 'https://example.com/electronics/smartphones',
    },
  });

  const cat2 = await prisma.category.create({
    data: {
      name: 'Laptops',
      navigationId: nav1.id,
      source_id: 'cat2',
      source_url: 'https://example.com/electronics/laptops',
    },
  });

  const cat3 = await prisma.category.create({
    data: {
      name: 'Shirts',
      navigationId: nav2.id,
      source_id: 'cat3',
      source_url: 'https://example.com/clothing/shirts',
    },
  });

  // Create sample products
  const prod1 = await prisma.product.create({
    data: {
      name: 'iPhone 14',
      categoryId: cat1.id,
      source_id: 'prod1',
      source_url: 'https://example.com/product/iphone14',
      last_scraped_at: new Date(),
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'MacBook Pro',
      categoryId: cat2.id,
      source_id: 'prod2',
      source_url: 'https://example.com/product/macbookpro',
      last_scraped_at: new Date(),
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'Cotton T-Shirt',
      categoryId: cat3.id,
      source_id: 'prod3',
      source_url: 'https://example.com/product/tshirt',
      last_scraped_at: new Date(),
    },
  });

  // Create product details
  await prisma.productDetail.createMany({
    data: [
      { productId: prod1.id, key: 'Brand', value: 'Apple' },
      { productId: prod1.id, key: 'Color', value: 'Black' },
      { productId: prod2.id, key: 'Brand', value: 'Apple' },
      { productId: prod2.id, key: 'RAM', value: '16GB' },
      { productId: prod3.id, key: 'Material', value: 'Cotton' },
      { productId: prod3.id, key: 'Size', value: 'M' },
    ],
  });

  // Create reviews
  await prisma.review.createMany({
    data: [
      { productId: prod1.id, rating: 5, comment: 'Great phone!' },
      { productId: prod1.id, rating: 4, comment: 'Good value.' },
      { productId: prod2.id, rating: 5, comment: 'Powerful laptop.' },
      { productId: prod3.id, rating: 3, comment: 'Okay shirt.' },
    ],
  });

  // Create scrape jobs
  await prisma.scrapeJob.createMany({
    data: [
      { url: 'https://example.com/scrape1', status: 'pending' },
      { url: 'https://example.com/scrape2', status: 'completed' },
    ],
  });

  // Create view history
  await prisma.viewHistory.createMany({
    data: [
      { productId: prod1.id, userId: 'user1' },
      { productId: prod2.id, userId: 'user2' },
      { productId: prod3.id },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
