import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateAssistantDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsArray()
  @IsOptional()
  languages?: string[];

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  contactMethod?: string;
}
