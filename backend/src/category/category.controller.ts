import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CategoryResponseDto } from './dto/category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID with subcategories' })
  @ApiResponse({ status: 200, description: 'Category details with subcategories', type: CategoryResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponseDto> {
    const category = await this.categoryService.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    // Assuming subcategories are categories with the same navigationId but different id
    const subcategories = await this.categoryService.findAll();
    const filteredSubcategories = subcategories.filter(
      (cat) => cat.navigationId === category.navigationId && cat.id !== category.id,
    );
    return {
      ...category,
      subcategories: filteredSubcategories,
    };
  }
}
