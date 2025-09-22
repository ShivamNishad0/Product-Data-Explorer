import { Controller, Get } from '@nestjs/common';

@Controller('metrics')
export class MetricsController {
  private jobCount = 0;
  private errorCount = 0;

  incrementJobCount() {
    this.jobCount++;
  }

  incrementErrorCount() {
    this.errorCount++;
  }

  @Get()
  getMetrics() {
    return {
      jobs: this.jobCount,
      errors: this.errorCount,
    };
  }
}

export const metricsController = new MetricsController();
