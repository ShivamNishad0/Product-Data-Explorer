import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  ProductResponseDto,
  ProductListResponseDto,
  ProductQueryDto,
} from './dto/product.dto';
import type { Cache } from 'cache-manager';

@ApiTags('products')
@Controller('products')
export class ProductController {
  private readonly ttlSeconds = Number(process.env.PRODUCT_CACHE_TTL_SECONDS) || 3600; // 1 hour default

  constructor(
    private readonly productService: ProductService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get product grid with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products',
    type: ProductListResponseDto,
  })
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<ProductListResponseDto> {
    const { categoryId, page = 1, limit = 10, q } = query;

    // Build filters
    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (q) {
      where.name = { contains: q, mode: 'insensitive' };
    }

    const cacheKey = `productList:${JSON.stringify(where)}:page:${page}:limit:${limit}`;
    const cached = await this.cacheManager.get<ProductListResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const [data, total] = await Promise.all([
      this.productService.findManyWithFilters(where, page, limit),
      this.productService.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);
    const result = { data, total, page, limit, totalPages };

    await this.cacheManager.set(cacheKey, result, this.ttlSeconds);

    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product detail',
    type: ProductResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDto> {
    const cacheKey = `product:${id}`;
    const cached = await this.cacheManager.get<ProductResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, product, this.ttlSeconds);

    return product;
  }
}
