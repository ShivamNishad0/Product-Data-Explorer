import { Controller, Get } from '@nestjs/common';
import { NavigationService } from './navigation/navigation.service';
import { CategoryService } from './category/category.service';
import { ProductService } from './product/product.service';

@Controller()
export class AppController {
  constructor(
    private readonly navigationService: NavigationService,
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
  ) {}

  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }

  @Get('navigations')
  async getNavigations() {
    return this.navigationService.findAll();
  }

  @Get('categories')
  async getCategories() {
    return this.categoryService.findAll();
  }

  @Get('products')
  async getProducts() {
    return this.productService.findAll();
  }
}
