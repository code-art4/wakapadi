import { IsString, IsNumber } from 'class-validator';

export class PingDto {
  @IsString()
  userId: string;

  @IsString()
  username: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
