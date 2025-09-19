import { Controller, Get, Param, Query, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductResponseDto, ProductListResponseDto, ProductQueryDto } from './dto/product.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get product grid with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of products', type: ProductListResponseDto })
  async findAll(@Query() query: ProductQueryDto): Promise<ProductListResponseDto> {
    const { categoryId, page = 1, limit = 10, q } = query;

    // Build filters
    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (q) {
      where.name = { contains: q, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.productService.findManyWithFilters(where, page, limit),
      this.productService.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail by ID' })
  @ApiResponse({ status: 200, description: 'Product detail', type: ProductResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }
}
