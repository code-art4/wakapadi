// src/training/training.module.ts
import { Module } from '@nestjs/common';
import { GeolocationService } from '../services/geolocation.service';
import { GeolocationController } from 'src/controllers/geolocation.controller';

@Module({
  controllers: [GeolocationController],
  providers: [GeolocationService],
})
export class GeolocationModule {}