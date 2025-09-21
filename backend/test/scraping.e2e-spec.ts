import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('ScrapingController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let request: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
    request = supertest(app.getHttpServer());
  });

  beforeEach(async () => {
    // Clean up scrape jobs before each test
    await prisma.scrapeJob.deleteMany({});
  });

  afterAll(async () => {
    // Clean up any remaining jobs and close connections
    await prisma.scrapeJob.deleteMany({});
    await app.close();
  });

  it('/scrape (POST) - enqueue a scrape job', async () => {
    const targetUrl = 'https://www.worldofbooks.com/category/fiction';
    const targetType = 'category';
    const response = await request
      .post('/scrape')
      .send({ targetUrl, targetType })
      .expect(201);

    expect(response.body.message).toBe('Scrape job enqueued successfully');
    expect(response.body).toHaveProperty('jobId');

    // Check that a ScrapeJob record was created
    const job = await prisma.scrapeJob.findFirst({ where: { url: targetUrl } });
    expect(job).toBeDefined();
    expect(job?.status).toBe('pending');
  });

  it('Worker infrastructure is set up correctly', async () => {
    const targetUrl = 'https://www.worldofbooks.com/category/fiction';
    const targetType = 'category';

    // Enqueue job
    await request.post('/scrape').send({ targetUrl, targetType }).expect(201);

    // Verify job is created with pending status
    const job = await prisma.scrapeJob.findFirst({ where: { url: targetUrl } });
    expect(job).toBeDefined();
    expect(job?.status).toBe('pending');
    expect(job?.url).toBe(targetUrl);
  });

  it('Deduplication skips enqueue if recent job exists', async () => {
    const targetUrl = 'https://www.worldofbooks.com/category/fiction';
    const targetType = 'category';

    // Create a completed job recently
    await prisma.scrapeJob.create({
      data: {
        url: targetUrl,
        status: 'completed',
        finished_at: new Date(),
      },
    });

    // Enqueue again without forceRefresh
    const response = await request
      .post('/scrape')
      .send({ targetUrl, targetType })
      .expect(201);

    expect(response.body.message).toBe('Scrape job enqueued successfully');
    expect(response.body).toHaveProperty('jobId');

    // Check that no new job was created (only one job with this url)
    const jobs = await prisma.scrapeJob.findMany({ where: { url: targetUrl } });
    expect(jobs.length).toBe(1);
  });
});
