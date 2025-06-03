
// src/contact/dto/create-contact.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(['inquiry', 'complaint', 'feedback', 'suggestion', 'other'])
  type: string;

  @IsString() @IsNotEmpty()
  message: string;

  @IsOptional()
  userId?: string;

  @IsOptional()
  meta?: Record<string, any>;
}
