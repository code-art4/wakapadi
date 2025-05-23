// tour.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateTourDto {
  @IsString()
  title: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  recurringSchedule?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  externalPageUrl?: string;
  @IsString()
  sourceType: string;

  @IsOptional()
  @IsString()
  image?: string;
}
