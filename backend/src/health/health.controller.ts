import { Controller, Get } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { PrismaService } from '../prisma.service';

@Controller('health')
export class HealthController {
  private queue: Queue;
  private worker: Worker;

  constructor(private readonly prisma: PrismaService) {
    this.queue = new Queue('scrapeQueue', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });

    this.worker = new Worker(
      'scrapeQueue',
      async () => {},
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
        },
      },
    );
  }

  @Get('worker')
  async checkWorker() {
    try {
      const isRunning = this.worker.isRunning();
      return { status: isRunning ? 'ok' : 'error' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('queue')
  async checkQueue() {
    try {
      const jobCounts = await this.queue.getJobCounts();
      return { status: 'ok', jobCounts };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('db')
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
