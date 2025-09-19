import { Controller, Post, Get, Param, Body, ParseIntPipe, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScrapingService } from './scraping.service';
import { ScrapeRequestDto, ScrapeJobResponseDto } from './dto/scrape.dto';
import { RateLimitGuard } from './rate-limit.guard';

@ApiTags('scraping')
@Controller('scrape')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Post()
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Enqueue on-demand scrape job' })
  @ApiResponse({ status: 201, description: 'Scrape job enqueued successfully' })
  async enqueueScrape(@Body() scrapeRequest: ScrapeRequestDto): Promise<{ message: string; jobId: number }> {
    const jobId = await this.scrapingService.enqueueScrape(scrapeRequest.targetUrl, scrapeRequest.targetType);
    return { message: 'Scrape job enqueued successfully', jobId };
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get scrape job status by ID' })
  @ApiResponse({ status: 200, description: 'Scrape job status', type: ScrapeJobResponseDto })
  async getScrapeJob(@Param('id', ParseIntPipe) id: number): Promise<ScrapeJobResponseDto> {
    const job = await this.scrapingService.getScrapeJob(id);
    if (!job) {
      throw new NotFoundException(`Scrape job with id ${id} not found`);
    }
    return job;
  }
}
