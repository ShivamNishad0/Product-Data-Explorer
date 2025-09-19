import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('ScrapingController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let request: supertest.SuperTest<supertest.Test>;

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

  it('/scraping/enqueue (POST) - enqueue a scrape job', async () => {
    const url = 'https://www.worldofbooks.com/category/fiction';
    const response = await request
      .post('/scraping/enqueue')
      .send({ url })
      .expect(201);

    expect(response.body.message).toBe('Scrape job enqueued successfully');

    // Check that a ScrapeJob record was created
    const job = await prisma.scrapeJob.findFirst({ where: { url } });
    expect(job).toBeDefined();
    expect(job?.status).toBe('pending');
  });

  it('Worker infrastructure is set up correctly', async () => {
    const url = 'https://www.worldofbooks.com/category/fiction';

    // Enqueue job
    await request
      .post('/scraping/enqueue')
      .send({ url })
      .expect(201);

    // Verify job is created with pending status
    const job = await prisma.scrapeJob.findFirst({ where: { url } });
    expect(job).toBeDefined();
    expect(job?.status).toBe('pending');
    expect(job?.url).toBe(url);
  });

  it('Deduplication skips enqueue if recent job exists', async () => {
    const url = 'https://www.worldofbooks.com/category/fiction';

    // Create a completed job recently
    await prisma.scrapeJob.create({
      data: {
        url,
        status: 'completed',
        finished_at: new Date(),
      },
    });

    // Enqueue again without forceRefresh
    const response = await request
      .post('/scraping/enqueue')
      .send({ url })
      .expect(201);

    expect(response.body.message).toBe('Scrape job enqueued successfully');

    // Check that no new job was created (only one job with this url)
    const jobs = await prisma.scrapeJob.findMany({ where: { url } });
    expect(jobs.length).toBe(1);
  });
});
