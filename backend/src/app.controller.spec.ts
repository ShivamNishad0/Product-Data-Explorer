import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NavigationService } from './navigation/navigation.service';
import { CategoryService } from './category/category.service';
import { ProductService } from './product/product.service';
import { PrismaService } from './prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        NavigationService,
        CategoryService,
        ProductService,
        PrismaService,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return { status: "ok" }', () => {
      expect(appController.healthCheck()).toEqual({ status: 'ok' });
    });
  });
});
