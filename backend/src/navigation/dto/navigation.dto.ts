import { IsString, IsOptional } from 'class-validator';

export class NavigationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsString()
  source_id: string;

  @IsString()
  source_url: string;
}

export class NavigationResponseDto {
  id: number;
  name: string;
  url: string | null;
  source_id: string;
  source_url: string;
  createdAt: Date;
  updatedAt: Date;
}
