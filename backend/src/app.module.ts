import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { NavigationModule } from './navigation/navigation.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { ScrapingModule } from './scraping/scraping.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, NavigationModule, CategoryModule, ProductModule, ScrapingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
