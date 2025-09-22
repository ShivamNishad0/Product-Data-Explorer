import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Observability and Security (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let request: any;
  const adminApiKey = process.env.ADMIN_API_KEY || 'your-secure-api-key-here';

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
    await prisma.scrapeJob.deleteMany({});
  });

  afterAll(async () => {
    await prisma.scrapeJob.deleteMany({});
    await app.close();
  });

  it('/scrape (POST) - rejects without API key', async () => {
    const targetUrl = 'https://www.worldofbooks.com/category/nonfiction';
    const targetType = 'category';
    await request.post('/scrape').send({ targetUrl, targetType }).expect(401);
  });

  it('/scrape (POST) - accepts with valid API key', async () => {
    const targetUrl = 'https://www.worldofbooks.com/category/nonfiction';
    const targetType = 'category';
    const response = await request
      .post('/scrape')
      .set('x-api-key', adminApiKey)
      .send({ targetUrl, targetType })
      .expect(201);

    expect(response.body.message).toBe('Scrape job enqueued successfully');
    expect(response.body).toHaveProperty('jobId');
  });

  it('/scrape/jobs/:id (GET) - returns job status', async () => {
    const targetUrl = 'https://www.worldofbooks.com/category/scifi';
    const targetType = 'category';

    // Enqueue job with API key
    const enqueueResponse = await request
      .post('/scrape')
      .set('x-api-key', adminApiKey)
      .send({ targetUrl, targetType })
      .expect(201);

    const jobId = enqueueResponse.body.jobId;

    // Get job status
    const jobResponse = await request.get(`/scrape/jobs/${jobId}`).expect(200);
    expect(jobResponse.body).toHaveProperty('id', jobId);
    expect(jobResponse.body).toHaveProperty('url', targetUrl);
  });

  it('/metrics (GET) - returns job and error counts', async () => {
    const response = await request.get('/metrics').expect(200);
    expect(response.body).toHaveProperty('jobs');
    expect(response.body).toHaveProperty('errors');
  });

  it('/health/worker (GET) - returns worker health status', async () => {
    const response = await request.get('/health/worker').expect(200);
    expect(response.body).toHaveProperty('status');
  });

  it('/health/queue (GET) - returns queue health status', async () => {
    const response = await request.get('/health/queue').expect(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('jobCounts');
  });

  it('/health/db (GET) - returns database health status', async () => {
    const response = await request.get('/health/db').expect(200);
    expect(response.body).toHaveProperty('status');
  });
});
