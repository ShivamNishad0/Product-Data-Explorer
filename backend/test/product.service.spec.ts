import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../src/product/product.service';
import { PrismaService } from '../src/prisma.service';

describe('ProductService', () => {
  let service: ProductService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const result = [{ id: 1, name: 'Product 1' }];
      (prisma.product.findMany as jest.Mock).mockResolvedValue(result);
      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const result = { id: 1, name: 'Product 1' };
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(result);
      expect(await service.findOne(1)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = {
        name: 'New Product',
        categoryId: 1,
        source_id: 'abc',
        source_url: 'url',
      };
      const result = { id: 1, ...dto };
      (prisma.product.create as jest.Mock).mockResolvedValue(result);
      expect(await service.create(dto)).toBe(result);
    });
  });

  describe('findManyWithFilters', () => {
    it('should return filtered products with pagination', async () => {
      const result = [{ id: 1, name: 'Product 1' }];
      (prisma.product.findMany as jest.Mock).mockResolvedValue(result);
      expect(await service.findManyWithFilters({}, 1, 10)).toBe(result);
    });
  });

  describe('count', () => {
    it('should return count of products', async () => {
      (prisma.product.count as jest.Mock).mockResolvedValue(5);
      expect(await service.count({})).toBe(5);
    });
  });
});
