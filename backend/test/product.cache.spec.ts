import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

describe('ProductController Cache (e2e)', () => {
  let app: INestApplication;
  let request: any;
  let cacheManager: Cache;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    request = supertest(app.getHttpServer());
    cacheManager = app.get<Cache>(CACHE_MANAGER);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // No direct cache reset method; skipping cache clear for simplicity
  });

  it('should cache product list responses', async () => {
    const res1 = await request
      .get('/products?categoryId=1&page=1&limit=5')
      .expect(200);
    expect(res1.body).toHaveProperty('data');
    const cacheKey = `productList:{"categoryId":1}:page:1:limit:5`;
    const cached = await cacheManager.get(cacheKey);
    expect(cached).toBeDefined();

    // Second request should hit cache
    const res2 = await request
      .get('/products?categoryId=1&page=1&limit=5')
      .expect(200);
    expect(res2.body).toEqual(cached);
  });

  it('should cache product detail responses', async () => {
    // First fetch product detail
    const res1 = await request.get('/products/1').expect(200);
    expect(res1.body).toHaveProperty('id', 1);
    const cacheKey = `product:1`;
    const cached = await cacheManager.get(cacheKey);
    expect(cached).toBeDefined();

    // Second fetch should hit cache
    const res2 = await request.get('/products/1').expect(200);
    expect(res2.body).toEqual(cached);
  });
});
