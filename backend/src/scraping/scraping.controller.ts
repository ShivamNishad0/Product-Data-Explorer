import { Controller, Post, Body } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Post('enqueue')
  async enqueueScrape(
    @Body('url') url: string,
    @Body('forceRefresh') forceRefresh?: boolean,
  ): Promise<{ message: string }> {
    await this.scrapingService.enqueueScrape(url, forceRefresh);
    return { message: 'Scrape job enqueued successfully' };
  }
}
