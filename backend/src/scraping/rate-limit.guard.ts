import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    return 10; // 10 requests per ttl
  }

  protected async getTtl(context: ExecutionContext): Promise<number> {
    return 60; // 60 seconds
  }
}
