import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateEnterpriseSolutionDto {
  @IsString()
  category: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  cncfProjectUsed?: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subcategories?: string[];
}

