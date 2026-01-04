import { IsString, IsOptional, IsNumber, IsDate, IsObject } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsString()
  maturityLevel: string;

  @IsOptional()
  @IsNumber()
  githubStars?: number;

  @IsOptional()
  @IsDate()
  lastUpdated?: Date;

  @IsOptional()
  @IsString()
  homepageUrl?: string;

  @IsOptional()
  @IsString()
  repoUrl?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  extra?: {
    github?: string;
    url?: string;
    twitter?: string;
  };
}

