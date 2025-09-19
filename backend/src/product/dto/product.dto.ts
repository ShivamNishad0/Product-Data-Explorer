import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type, Expose } from 'class-transformer';

export class ProductQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  q?: string;
}

export class ProductDetailDto {
  @Expose()
  id: number;
  @Expose()
  key: string;
  @Expose()
  value: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}

export class ReviewDto {
  @Expose()
  id: number;
  @Expose()
  rating: number;
  @Expose()
  comment: string | null;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}

export class ProductResponseDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  source_id: string;
  @Expose()
  source_url: string;
  @Expose()
  last_scraped_at: Date | null;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
  @Expose()
  categoryId: number;
  @Expose()
  product_details: ProductDetailDto[];
  @Expose()
  reviews: ReviewDto[];
}

export class ProductListResponseDto {
  @Expose()
  data: ProductResponseDto[];
  @Expose()
  total: number;
  @Expose()
  page: number;
  @Expose()
  limit: number;
  @Expose()
  totalPages: number;
}
