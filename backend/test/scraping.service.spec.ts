import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingService } from '../src/scraping/scraping.service';
import { PrismaService } from '../src/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PlaywrightCrawler } from 'crawlee';
import { Queue, Worker, Job } from 'bullmq';

jest.mock('crawlee');
jest.mock('bullmq');

describe('ScrapingService', () => {
  let service: ScrapingService;
  let prisma: PrismaService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapingService,
        {
          provide: PrismaService,
          useValue: {
            scrapeJob: {
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
            },
            navigation: {
              upsert: jest.fn(),
            },
            category: {
              upsert: jest.fn(),
            },
            product: {
              upsert: jest.fn(),
            },
            productDetail: {
              findFirst: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            review: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScrapingService>(ScrapingService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enqueueScrape', () => {
    it('should return cached job id if cache exists and forceRefresh is false', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(123);
      const result = await service.enqueueScrape('http://example.com', 'type');
      expect(result).toBe(123);
      expect(cacheManager.get).toHaveBeenCalledWith('scrape:http://example.com');
    });

    it('should skip enqueue if recent job exists and forceRefresh is false', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.scrapeJob.findFirst as jest.Mock).mockResolvedValue({ id: 456 });
      (cacheManager.set as jest.Mock).mockResolvedValue(null);
      (service['queue'].add as jest.Mock) = jest.fn();
      (prisma.scrapeJob.create as jest.Mock).mockResolvedValue({ id: 456 });
      const result = await service.enqueueScrape('http://example.com', 'type');
      expect(result).toBe(456);
      expect(prisma.scrapeJob.findFirst).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('scrape:http://example.com', 456, expect.any(Number));
    });

    it('should enqueue new job if no cache or recent job', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.scrapeJob.findFirst as jest.Mock).mockResolvedValue(null);
      (service['queue'].add as jest.Mock) = jest.fn().mockResolvedValue({ id: 'job1' });
      (prisma.scrapeJob.create as jest.Mock).mockResolvedValue({ id: 789 });
      (cacheManager.set as jest.Mock).mockResolvedValue(null);
      const result = await service.enqueueScrape('http://example.com', 'type');
      expect(service['queue'].add).toHaveBeenCalledWith('scrape', { url: 'http://example.com', targetType: 'type' });
      expect(prisma.scrapeJob.create).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result).toBe(789);
    });
  });

  describe('processJob', () => {
    it('should process job successfully and update status to completed', async () => {
      const job = { id: 1, data: { url: 'http://example.com' } } as any;
      const updateMock = prisma.scrapeJob.update as jest.Mock;
      updateMock.mockResolvedValueOnce(null); // for started_at update
      updateMock.mockResolvedValueOnce(null); // for completed update

      // Mock PlaywrightCrawler and its run method
      const runMock = jest.fn().mockResolvedValue(null);
      (PlaywrightCrawler as jest.Mock).mockImplementation(() => ({
        run: runMock,
      }));

      await service['processJob'](job);

      expect(updateMock).toHaveBeenCalledTimes(2);
      expect(runMock).toHaveBeenCalledWith([job.data.url]);
    });

    it('should handle errors and update status to failed', async () => {
      const job = { id: 1, data: { url: 'http://example.com' } } as any;
      const updateMock = prisma.scrapeJob.update as jest.Mock;
      updateMock.mockResolvedValue(null);

      // Mock PlaywrightCrawler to throw error
      (PlaywrightCrawler as jest.Mock).mockImplementation(() => ({
        run: jest.fn().mockRejectedValue(new Error('fail')),
      }));

      await service['processJob'](job);

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'failed' }),
        }),
      );
    });
  });

  describe('scrapeCategoryPage', () => {
    it('should scrape navigation headings and categories', async () => {
      const page = {
        waitForSelector: jest.fn().mockResolvedValue(null),
        $$eval: jest.fn()
          .mockResolvedValueOnce(['Heading1', 'Heading2'])
          .mockResolvedValueOnce([
            { name: 'Cat1', url: '/cat1' },
            { name: 'Cat2', url: '/cat2' },
          ]),
      } as any;

      const upsertNavMock = prisma.navigation.upsert as jest.Mock;
      const upsertCatMock = prisma.category.upsert as jest.Mock;
      upsertNavMock.mockResolvedValue(null);
      upsertCatMock.mockResolvedValue(null);

      const result = await service['scrapeCategoryPage'](page);

      expect(page.waitForSelector).toHaveBeenCalledWith('nav[aria-label="Main navigation"]');
      expect(page.$$eval).toHaveBeenCalledTimes(2);
      expect(upsertNavMock).toHaveBeenCalledTimes(2);
      expect(upsertCatMock).toHaveBeenCalledTimes(2);
      expect(result.navigationHeadings).toEqual(['Heading1', 'Heading2']);
      expect(result.categories).toEqual([
        { name: 'Cat1', url: '/cat1' },
        { name: 'Cat2', url: '/cat2' },
      ]);
    });
  });

  describe('scrapeProductPage', () => {
    it('should scrape products and product details', async () => {
      const page = {
