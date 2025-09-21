import { IsInt, IsString } from 'class-validator';

export class CategoryDto {
  @IsString()
  name: string;

  @IsInt()
  navigationId: number;

  @IsString()
  source_id: string;

  @IsString()
  source_url: string;
}

export class SubCategoryDto {
  id: number;
  name: string;
  source_id: string;
  source_url: string;
  navigationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryResponseDto {
  id: number;
  name: string;
  source_id: string;
  source_url: string;
  navigationId: number;
  createdAt: Date;
  updatedAt: Date;
  subcategories?: SubCategoryDto[];
}
