
import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { PlaywrightCrawler } from 'crawlee';
import { chromium } from 'playwright';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private queue: Queue;
  private worker: Worker;

  constructor(private readonly prisma: PrismaService) {
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

  async enqueueScrape(url: string, forceRefresh = false): Promise<void> {
    // Deduplication: check if a recent job exists for the same URL
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
      return;
    }

    await this.queue.add('scrape', { url });
    await this.prisma.scrapeJob.create({
      data: {
        url,
        status: 'pending',
      },
    });
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
    // Example scraping logic for category page
    await page.waitForSelector('.category-title');
    const categoryName = await page.$eval('.category-title', (el) => el.textContent?.trim());
    return { categoryName };
  }

  private async scrapeProductPage(page: any): Promise<any> {
    // Example scraping logic for product page
    await page.waitForSelector('.product-title');
    const productName = await page.$eval('.product-title', (el) => el.textContent?.trim());
    return { productName };
  }
}
