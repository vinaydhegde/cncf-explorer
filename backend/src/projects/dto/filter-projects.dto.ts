import { IsOptional, IsString } from 'class-validator';

export class FilterProjectsDto {
  @IsOptional()
  @IsString()
  maturityLevel?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;
}

