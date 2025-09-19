import { Module } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { ScrapingController } from './scraping.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ScrapingService],
  controllers: [ScrapingController],
  exports: [ScrapingService],
})
export class ScrapingModule {}
