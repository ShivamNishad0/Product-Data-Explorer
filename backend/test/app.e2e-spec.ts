import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let request: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    request = supertest(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('/navigations (GET)', () => {
    return request
      .get('/navigations')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/categories/:id (GET) - existing category', async () => {
    // Assuming category with id 1 exists
    const res = await request.get('/categories/1').expect(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('subcategories');
  });

  it('/categories/:id (GET) - non-existing category', () => {
    return request.get('/categories/999999').expect(404);
  });

  it('/products (GET) - pagination and filters', () => {
    return request
      .get('/products?categoryId=1&page=1&limit=5&q=test')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('page', 1);
        expect(res.body).toHaveProperty('limit', 5);
      });
  });

  it('/products/:id (GET) - existing product', async () => {
    // Assuming product with id 1 exists
    const res = await request.get('/products/1').expect(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('product_details');
    expect(res.body).toHaveProperty('reviews');
  });

  it('/products/:id (GET) - non-existing product', () => {
    return request.get('/products/999999').expect(404);
  });

  it('/scrape (POST) - enqueue scrape job', () => {
    return request
      .post('/scrape')
      .send({ targetUrl: 'http://example.com', targetType: 'category' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('jobId');
      });
  });

  it('/scrape/jobs/:id (GET) - get scrape job status', async () => {
    // Assuming scrape job with id 1 exists
    const res = await request.get('/scrape/jobs/1').expect(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('status');
  });

  it('/scrape/jobs/:id (GET) - non-existing scrape job', () => {
    return request.get('/scrape/jobs/999999').expect(404);
  });
});
