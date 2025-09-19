
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma.service';
import { PlaywrightCrawler } from 'crawlee';
import { chromium } from 'playwright';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private queue: Queue;
  private worker: Worker;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.queue = new Queue('scrapeQueue', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    this.worker = new Worker(
      'scrapeQueue',
      async (job: Job) => {
        await this.processJob(job);
      },
      {
        concurrency: 3,
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
        },
      },
    );
  }

  async enqueueScrape(url: string, targetType: string, forceRefresh = false): Promise<number> {
    // Deduplication: check if a recent job exists for the same URL
    const cacheKey = `scrape:${url}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached && !forceRefresh) {
      this.logger.log(`Returning cached scrape job id for ${url}`);
      return cached as number;
    }

    const existingJob = await this.prisma.scrapeJob.findFirst({
      where: {
        url,
        status: 'completed',
        finished_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24 hours
        },
      },
      orderBy: {
        finished_at: 'desc',
      },
    });

    if (existingJob && !forceRefresh) {
      this.logger.log(`Skipping enqueue for ${url} as recent job exists.`);
      await this.cacheManager.set(cacheKey, existingJob.id, 24 * 60 * 60);
      return existingJob.id;
    }

    const job = await this.queue.add('scrape', { url, targetType });
    const scrapeJob = await this.prisma.scrapeJob.create({
      data: {
        url,
        status: 'pending',
      },
    });
    await this.cacheManager.set(cacheKey, scrapeJob.id, 24 * 60 * 60);
    return scrapeJob.id;
  }

  private async processJob(job: Job): Promise<void> {
    this.logger.log(`Processing job ${job.id} for URL: ${job.data.url}`);

    // Update job started_at and status
    await this.prisma.scrapeJob.update({
      where: { id: Number(job.id) },
      data: { started_at: new Date(), status: 'in_progress' },
    });

    try {
      const crawler = new PlaywrightCrawler({
        launchContext: {
          launchOptions: {
            headless: true,
          },
        },
        maxConcurrency: 3,
        requestHandler: async ({ page, request }) => {
          // Basic scraping logic for worldofbooks category or product page
          const url = request.url;
          let data = {};

          if (url.includes('/category/')) {
            // Scrape category page
            data = await this.scrapeCategoryPage(page);
          } else if (url.includes('/product/')) {
            // Scrape product page
            data = await this.scrapeProductPage(page);
          } else {
            throw new Error('Unsupported URL type for scraping');
          }

          // Persist scraped data to DB here (simplified)
          this.logger.log(`Scraped data for ${url}: ${JSON.stringify(data)}`);

          // Mark job as completed
          await this.prisma.scrapeJob.update({
            where: { id: Number(job.id) },
            data: { status: 'completed', finished_at: new Date() },
          });
        },
        failedRequestHandler: async ({ request, error }) => {
          const err = error as Error;
          this.logger.error(`Failed to scrape ${request.url}: ${err.message}`);

          await this.prisma.scrapeJob.update({
            where: { id: Number(job.id) },
            data: { status: 'failed', error_log: err.message, finished_at: new Date() },
          });
        },
      });

      await crawler.run([job.data.url]);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error processing job ${job.id}: ${err.message}`);

      await this.prisma.scrapeJob.update({
        where: { id: Number(job.id) },
        data: { status: 'failed', error_log: err.message, finished_at: new Date() },
      });
    }
  }

  private async scrapeCategoryPage(page: any): Promise<any> {
    // Scrape navigation headings and categories/subcategories
    await page.waitForSelector('nav[aria-label="Main navigation"]');
    const navigationHeadings = await page.$$eval('nav[aria-label="Main navigation"] > ul > li > a', els =>
      els.map(el => el.textContent?.trim()).filter(Boolean)
    );

    // Scrape categories and subcategories (example selectors, adjust as needed)
    const categories = await page.$$eval('.category-list > li > a', els =>
      els.map(el => ({
        name: el.textContent?.trim(),
        url: el.getAttribute('href'),
      }))
    );

    // Persist navigation and categories to DB (simplified example)
    for (const heading of navigationHeadings) {
      await this.prisma.navigation.upsert({
        where: { source_id: heading.toLowerCase().replace(/\s+/g, '-') },
        update: {},
        create: { name: heading, source_id: heading.toLowerCase().replace(/\s+/g, '-'), source_url: '' },
      });
    }

    for (const category of categories) {
      await this.prisma.category.upsert({
        where: { source_url: category.url || '' },
        update: {},
        create: {
          name: category.name || '',
          source_id: category.name?.toLowerCase().replace(/\s+/g, '-') || '',
          source_url: category.url || '',
          navigationId: 1, // TODO: link to correct navigation id
        },
      });
    }

    return { navigationHeadings, categories };
  }

  private async scrapeProductPage(page: any): Promise<any> {
    // Scrape product tiles/cards on category page
    await page.waitForSelector('.product-tile');
    const products = await page.$$eval('.product-tile', tiles =>
      tiles.map(tile => {
        const title = tile.querySelector('.product-title')?.textContent?.trim() || '';
        const author = tile.querySelector('.product-author')?.textContent?.trim() || '';
        const price = tile.querySelector('.product-price')?.textContent?.trim() || '';
        const image = tile.querySelector('img')?.getAttribute('src') || '';
        const productLink = tile.querySelector('a')?.getAttribute('href') || '';
        const sourceId = productLink.split('/').pop() || '';
        return { title, author, price, image, productLink, sourceId };
      })
    );

    // Scrape product detail page info if on product page
    const isProductPage = await page.$('.product-detail');
    let productDetails: { description?: string; reviews?: { rating: string; comment: string }[] } = {};
    if (isProductPage) {
      await page.waitForSelector('.product-description');
      const description = await page.$eval('.product-description', el => el.textContent?.trim() || '');
      const reviews = await page.$$eval('.review', reviews =>
        reviews.map(r => ({
          rating: r.querySelector('.rating')?.textContent?.trim() || '',
          comment: r.querySelector('.comment')?.textContent?.trim() || '',
        }))
      );
      productDetails = { description, reviews };
    }

    // Persist products and details to DB (simplified example)
    for (const product of products) {
      const prod = await this.prisma.product.upsert({
        where: { source_id: product.sourceId },
        update: {
          name: product.title,
          last_scraped_at: new Date(),
        },
        create: {
          name: product.title,
          source_id: product.sourceId,
          source_url: product.productLink,
          categoryId: 1, // TODO: link to correct category id
        },
      });

      if (productDetails.description) {
        // Prisma does not support composite unique keys in upsert where clause directly
        // So we try to find existing record first, then update or create accordingly
        const existingDetail = await this.prisma.productDetail.findFirst({
          where: { productId: prod.id, key: 'description' },
        });
        if (existingDetail) {
          await this.prisma.productDetail.update({
            where: { id: existingDetail.id },
            data: { value: productDetails.description },
          });
        } else {
          await this.prisma.productDetail.create({
            data: { productId: prod.id, key: 'description', value: productDetails.description },
          });
        }
      }

      for (const review of productDetails.reviews || []) {
        await this.prisma.review.create({
          data: {
            productId: prod.id,
            rating: parseInt(review.rating) || 0,
            comment: review.comment,
          },
        });
      }
    }

    return { products, productDetails };
  }

  async getScrapeJob(id: number) {
    return this.prisma.scrapeJob.findUnique({
      where: { id },
    });
  }
}
