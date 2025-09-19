import { IsString, IsEnum } from 'class-validator';

export enum TargetType {
  NAVIGATION = 'navigation',
  CATEGORY = 'category',
  PRODUCT = 'product',
}

export class ScrapeRequestDto {
  @IsString()
  targetUrl: string;

  @IsEnum(TargetType)
  targetType: TargetType;
}

export class ScrapeJobResponseDto {
  id: number;
  url: string;
  status: string;
  error_log: string | null;
  started_at: Date | null;
  finished_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
